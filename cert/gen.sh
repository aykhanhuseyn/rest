# Desc: Clear previous certificates if exist
rm -f ./cert.pem
rm -f ./key.pem
rm -f ./key-tmp.pem

# Desc: Generate a self-signed certificate for the server
openssl req -x509 -newkey rsa:2048 -keyout ./keytmp.pem -out ./cert.pem -days 365

# Desc: Remove the passphrase from the key
openssl rsa -in ./keytmp.pem -out ./key.pem
