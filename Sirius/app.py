from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from virtualbox import library
import virtualbox
import os


# Initialize Flask app
app = Flask(__name__)

# Set the port for Flask app
port = int(os.environ.get('PORT', 5000))

# Change this to your secret key (can be anything, it's for extra protection)
app.secret_key = 'canada$God7972#'


vbox = virtualbox.VirtualBox()
session = virtualbox.Session()

def find_machine(vm_name):
    return vbox.find_machine(vm_name)


def show_all():
    l = []
    for m in vbox.machines:
        l.append(m.name)
    return l

def start(vm_name):
    try:
        vm = find_machine(vm_name)
        progress = vm.launch_vm_process(session, "gui", "".encode())
        progress.wait_for_completion()
    except: 
        return redirect(url_for('index',name=vm_name))

def stop(vm_name):
    try:
        session.console.power_down()
    except:
        return redirect(url_for('index',name=vm_name))

def session_state(vm_name):
    return session.state

def machine_info(vm_name):
    global vm
    try:
        machine_state = vm.state
    except:
        machine_state = "None"
    finally:
        try:
            session_type = session.type_p
        except:
            session_type = "None"
        finally:
            try:
                home_folder = vbox.home_folder
            except:
                home_folder = "N/A"
            finally:
                return (machine_state,session_type,home_folder)

def resolution(vm_name):
    try:
        h, w, _, _, _, _ = session.console.display.get_screen_resolution(0)
    except:
        h = "N/A"
        w = "N/A"
    finally:
        return (h,w)
        
def send_string(vm_name, string):
    try:
        session.console.keyboard.put_keys(string)
    except:
        return redirect(url_for('index',name=vm_name))
    
    
# Main Route
@app.route('/home/<name>', methods=['GET', 'POST'])
def index(name):
    nav = show_all()
    if request.method == 'POST' and 'keystroke' in request.form:
        keystroke = request.form["keystroke"]
        try:
            send_string(name,keystroke)   
        finally:
            try:
                sess_state = session_state(name)
            finally:
                try:
                    machine_state, session_type, home_folder = machine_info(name)
                finally:
                    try:
                        h, w = resolution(name)
                    finally:
                        return render_template('index.html',nav = nav, name = name, sess_state = sess_state , machine_state = machine_state , session_type = session_type, home_folder = home_folder, h = h, w = w)
    elif (name=="None"):
        return render_template('index.html', name = name)
    else:
        try:
            sess_state = session_state(name)
        finally:
            try:
                machine_state, session_type, home_folder = machine_info(name)
            finally:
                try:
                    h, w = resolution(name)
                finally:
                    return render_template('index.html',nav = nav, name = name, sess_state = sess_state , machine_state = machine_state , session_type = session_type, home_folder = home_folder, h = h, w = w)

# Redirect Route
@app.route('/', methods=['GET', 'POST'])
def default():
    nav = show_all()
    if (len(nav)>0):
        return redirect(url_for('index',name=nav[0]))
    else:
        return redirect(url_for('index',name="None"))
    
# Handle Route
@app.route('/handle/<name>/<code>', methods=['GET', 'POST'])
def handle(name,code):
    if (code=="start"):
        start(name)
        return redirect(url_for('index',name=name))
    else:
        stop(name)
        return redirect(url_for('index',name=name))
    
    
    
# Run Flask app
if __name__ == '__main__':
	app.run(host='0.0.0.0', port=port, debug=True)
