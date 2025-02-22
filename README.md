# schoolbot
RAG System complete with a react frontend for generating questions/grading assignments given context

# Setup
## Step 0 - Prerequisites:
Install node from https://nodejs.org/en/download if it's not already installed.
## Step 1 - Installation:
From the root directory, open a bash terminal and run:

```bash 
npm install
```
Once installation is complete, repeat this in both frontend and backend directories, installation will take some time.
###### Note: There will probably be some warnings, as this project is currently incomplete, and not a complete production version, these are normal, you may attempt to simple fix these warnings by following the directions outputted to the console, these warnings themselves do not affect how well the project runs.

## Step 2 - Environment Setup:
In the backend directory, create a new file ".env":

```bash 
touch .env
```

Add your OpenAI API key, as the project currently leverages OpenAI's ChatGPT for RAG operations.

You can get an API key from https://platform.openai.com/api-keys.

Configure the .env file to have a variable "OPENAI_KEY", as the project currently relies on the name of this variable, make sure it matches the below format:

```example
OPENAI_KEY="sk-proj-xxxx..."
```
## Step 3 - Running the Application:
At this point, you can run the application and use it to your content!

To run the app, first, through a bash terminal, run the following command in the backend directory:

```
node server
```

Once the message ```Server running on port 5000``` is displayed on the terminal, go to the frontend directory, open a second terminal window and run the below command:

```
npm start
```

After a few seconds, a browser window will pop up with the application ready to use.
