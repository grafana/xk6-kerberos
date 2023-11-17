REALM=EXAMPLE.COM

USERNAME=testuser
PASSWORD=testpwd

HTTP_PRINCIPAL=HTTP/http.example.com
HTTP_PASSWORD=httppwd

echo "Kerberos initialisation required. Creating database for ${REALM}..."
MASTER_PASSWORD=$(echo $RANDOM$RANDOM$RANDOM | md5sum | awk '{print $1}')
/usr/sbin/kdb5_util create -r ${REALM} -s -P ${MASTER_PASSWORD}
echo "Kerberos database created."

echo "Creating user for ${REALM}..."
/usr/sbin/kadmin.local -q "add_principal -pw ${PASSWORD} -kvno 1 ${USERNAME}"
echo "Kerberos user (${USERNAME}) created."

echo "Creating http principal for ${REALM}..."
/usr/sbin/kadmin.local -q "add_principal -pw ${HTTP_PASSWORD} -kvno 1 ${HTTP_PRINCIPAL}"
echo "Kerberos principal (${HTTP_PRINCIPAL}) created."