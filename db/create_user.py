import requests
import json
import sys
import os

def send_put_request(url, data):
    # Convert the data to JSON format
    json_data = json.dumps(data)

    # Send a PUT request
    response = requests.put(url, data=json_data, headers={'Content-Type': 'application/json',
                                                          'Accept': 'application/json'})

    # Check if the request was successful
    if response.status_code == 200:
        print("Request successful.")
        print("Response:", response.text)
    else:
        print("Request failed.")
        print("Status code:", response.status_code)
        print("Response:", response.text)





def main():
    if len(sys.argv) != 3:
        print("Usage: script.py new_username new_password")
        sys.exit(1)

    new_username = sys.argv[1]
    new_password = sys.argv[2]

    admin_username = os.getenv('ADMIN_USERNAME')
    admin_password = os.getenv('ADMIN_PASSWORD')

    if not admin_username or not admin_password:
        print("ADMIN_USERNAME and/or ADMIN_PASSWORD and/or password not set in environment variables.")
        sys.exit(1)

    base_url = "https://" + admin_username + ":" + admin_password + "@db.pkm.venerablesystems.com"
    url = base_url + "/_users/org.couchdb.user:" + new_username



    data = {
            "name": new_username,
            "password": new_password,
            "roles": [],
            "type": "user" }

    send_put_request(url, data)


if __name__ == "__main__":
    main()
                                                   