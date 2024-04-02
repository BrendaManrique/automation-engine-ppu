<div align="center">
  <div>Automation Engine</div>
</div>

<br/>

<p align="center">
    <a href="https://github.com/BrendaManrique">
        <img alt="Author" src="https://img.shields.io/badge/Author-BrendaManrique-blue?style=for-the-badge&logo=appveyor">
    </a> 
    <br/>
    <a href="https://www.npmjs.com/package/automation-engine">
        <img alt="GitHub Workflow Status" src="https://img.shields.io/npm/v/automation-engine/latest?label=CLI&style=for-the-badge">
    </a>
</p>

## Tecnologies

<div align="center">
  <img src="assets/TechLogos.png" style="height='128px'">
</div>

This project was developed using:

-   [Typescript](https://www.typescriptlang.org/)
-   [NodeJS](https://nodejs.dev/)
-   [ReactJS](https://reactjs.org/)
-   [Remotion](https://www.remotion.dev/)

## ⚙️ Requirements

-   You need to install both NodeJS, Yarn, FFMPEG and Full Google Chrome to run this project (To run it on as Server Side, check actions workflow.
-   Access to YouTube API and/or Account on Instagram

## 💻 Getting started

### Install and Usage

**Clone repository**

```sh-session
$ git clone https://github.com/BrendaManrique/automation-engine.git
```

**Install dependencies**

```sh-session
$ yarn
```

**Build and configure**

```sh-session
$ cp .env.local .env
$ vim .env
```

or

```sh-session
$ yarn build
$ ./bin/run configure
```

### Generate YT Refresh token

**Via terminal**
a) Generate client id and secret key.

b) Add Google logged in user as a Test user in consent screen.

c) Generate Authorization Code (One Time)
```
https://accounts.google.com/o/oauth2/auth?client_id=xxxxxxxx&redirect_uri=http://localhost&response_type=code&scope=https://www.googleapis.com/auth/drive&access_type=offline
```

d) Generate Refresh Token (One Time)
```
curl --request POST --data "code=xxxxxxxx&client_id=xxxxxxxxxxxx&client_secret=xxxxxxxxxxxx&redirect_uri=http://localhost&grant_type=authorization_code" https://oauth2.googleapis.com/token
```

e) Generate Access Token (Always)
```
curl --request POST --data "client_id=xxxxxxxxxxx&client_secret=xxxxxxxxxxxxxxx&refresh_token=xxxxxxxxxxxxx&grant_type=refresh_token" https://oauth2.googleapis.com/token
```

Note : Refresh Tokens expire in 1 week if your app is not set as production. Change status of your app to production to use your refresh token always.

E.G.
Copy to Browser:
```
https://accounts.google.com/o/oauth2/auth?client_id=1111-9s9999v.apps.googleusercontent.com&redirect_uri=http://localhost:3000/oauth2callback&response_type=code&scope=https://www.googleapis.com/auth/youtube.upload&access_type=offline
```

Copy to terminal:
```
curl --request POST --data "code=4\\F0AVVVVVVVVVVVg&client_id=724425579317-si0un8een9u1v08gu6nbihe5uopjs0mp.apps.googleusercontent.com&client_secret=GOGGG-NJhNNNNNNk6&redirect_uri=http://localhost:3000/oauth2callback&grant_type=authorization_code" https://oauth2.googleapis.com/token
```

Then retrieve the refresh token.

-or-

**Via Google Playground**

a) Create credentials

-Go to https://console.cloud.google.com/apis/credentials
-Enable API: YT Data API v3
-Create a Project and Credentials:
OAuth 2.0 Client IDs
Authorized JavaScript origins: http://localhost:3000 ,http://localhost
Authorized redirect URIs: http://localhost:3000/oauth2callback, http://localhost, https://developers.google.com/oauthplayground

-Extract the Client ID: 11111111111-222222222222222nbv.apps.googleusercontent.com
Client secret: GGGGGG-NNNNNNNNNNNNN6
-Inside oAuth Consent Screen, add the user email

b) Retrieve refresh token

- Go to https://developers.google.com/oauthplayground
- Select config icon, upper right corner:
-Access type: offline
-Enable Use your own OAuth credentials and paste Client ID and Secret

-Select and authorize APIS:
YouTube Analytics API v2
https://www.googleapis.com/auth/youtube
YouTube Data API v3 v3
https://www.googleapis.com/auth/youtube
https://www.googleapis.com/auth/youtube.upload


-Click Exchange authorization code for tokens
-Retrieve refresh token

**AZURE TTS Config**
- Create an Azure tts service.

**Configure Secret Keys inside Github**
-Go to Project main page
-Go to Settings, secrets and variables, Actions
-Add all secret keys in CAPS. 


**To run a workflow**
-Go to Actions and run the Create a Video workflow.

### Run video render locally
- Ensure that props.json has the correct props. 
- yarn remotion preview ./video/src/index.js --props=./props.json   
- yarn remotion render ./video/src/index.js Main out/out.mp4 --props=./props.json

### Create content locally
- Run ./bin/dev create youtube -f demo-content.json -u -t
- yarn remotion render video/src/index.js Main out/video.mp4 --props=./public/demo-content.json

###Run server locally
python3 -m pip install --upgrade pip

python3 -m venv myenv
source myenv/bin/activate
deactivate

**Run python endpoints**
cd server
source myenv/bin/activate
python3 app.py 

**Create Fast API**
pip install fastapi uvicorn mangum
pip freeze > requirements.txt
Erase everything but 
fastapi==0.89.1
mangum==0.17.0

Once the server is completed
uvicorn main:app --reload 
- or -
uvicorn main:app --host 127.0.0.1 --port 8000
The app will run here ->  http://127.0.0.1:8000/docs

Create dependencies for AWS Lambda
pip3 install -t dependencies -r requirements.txt
A new dependencies directory will show up

Bundle to create a lambda artifact
(cd dependencies; zip ../aws_lambda_artifact.zip -r .)

Update the artifact with our server app
zip aws_lambda_artifact.zip -u main.py

Upload the artifact in Lambda
and change handler to -> main.handler

**Use CLI**

```sh-session
$ ./bin/dev --help
```

.VSCODE -> launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
        "type": "node",
        "request": "launch",
        "name": "Launch Program",
        "program": "${workspaceFolder}/bin/dev",
        "args": [
            "create",
            "youtube",
            "-t",
            "--upload"
        ]
        }
    ]
}

# Problem Solving

## File content not being saved

- Actions -> Cache -> Delete cache


## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with 💜 by Brenda Manrique
