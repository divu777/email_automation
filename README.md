# Email Automation Application

This application is designed to process incoming emails efficiently using a combination of the Gmail API, Groq API, TypeScript, and Redis Queue and Workers. It follows a streamlined workflow:

1. Email Ingestion: Retrieves new emails from a specified Gmail inbox using the Gmail API via OAuth.
2. Groq Processing: Sends each retrieved email to the Groq API for natural language processing and analysis. Groq generates a comprehensive response based on the email's content.
3. Response Queueing: Adds the generated response to a Redis queue for efficient and scalable processing.
4. Email Sending: Workers consume messages from the Redis queue, crafting new email messages based on the Groq-generated responses. These messages are then sent using appropriate email delivery methods.

## Technologies Used:

TypeScrip
Gmail API
Groq API
Redis
Docker (for Redis)

## Installation:

### Clone the repository:

bash `git clone https://github.com/yourusername/your-repo-name.git`

### Install dependencies:

bash `npm i `

### Set up environment variables

### Build the TypeScript project:

bash` tsc -b`

### Start the application:

- Option 1:
  - Run Docker Compose Ensure Docker Compose is installed.
  - Run bash`docker-compose up` to start the Redis container and the application.
  - Run bash`node dist/index.js` to start the application.
- Option 2:
  - Set up Redis locally
  - Install Redis locally.
  - Configure your Redis host and port in the environment variables.
  - Run bash`node dist/index.js` to start the application.

### Enjoy using email automation :`)`
