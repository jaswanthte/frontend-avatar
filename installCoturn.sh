#!/bin/bash

# Update package repositories
sudo apt-get -y update

# Install Coturn server
sudo apt-get install coturn -y

# Stop Coturn server
sudo service coturn stop

# Enable TURN server by adding configuration in /etc/default/coturn
echo 'TURNSERVER_ENABLED=1' | sudo tee -a /etc/default/coturn

# Backup existing turnserver.conf and create a new one
sudo mv /etc/turnserver.conf /etc/turnserver.conf.bak
sudo touch /etc/turnserver.conf

# Add configuration to the turnserver.conf file
sudo tee /etc/turnserver.conf > /dev/null <<EOF
# Listener IP address of relay server. Multiple listeners can be specified.
# If no IP(s) specified in the config file or in the command line options, 
# then all IPv4 and IPv6 system IPs will be used for listening.
listening-ip=0.0.0.0
#listening-ip=10.207.21.238
#listening-ip=2607:f0d0:1002:51::4

min-port=49152
max-port=65535

# Uncomment to run TURN server in 'normal' 'moderate' verbose mode.
# By default the verbose mode is off.
verbose

# Uncomment to use fingerprints in the TURN messages.
# By default the fingerprints are off.
fingerprint

# Uncomment to use long-term credential mechanism.
# By default no credentials mechanism is used (any user allowed).
lt-cred-mech

# 'Static' user accounts are NOT dynamically checked by the turnserver process, 
# so that they can NOT be changed while the turnserver is running.
user=user117:passworD@368
#user=username2:key2
# OR:
#user=username1:password1

# Log file location
log-file=/var/log/turn.log

# Option to redirect all log output into system log (syslog).
syslog

# Enable Web-admin support on https. By default it is Disabled.
# If it is enabled it also enables a http a simple static banner page
# with a small reminder that the admin page is available only on https.
web-admin

# Local system IP address to be used for Web-admin server endpoint. Default value is 127.0.0.1.
web-admin-ip=0.0.0.0

# Web-admin server port. Default is 8080.
EOF

# Restart Coturn server to apply the changes
sudo service coturn restart
