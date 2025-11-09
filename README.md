
# Quasar2.0-LinkFixer

## A web-scraping website which shows all the broken links in the website

Broken links in a website not only result in bad user experience but also result in bad SEO rankings which could directly effect the website's reach. This project helps solve these problems using a web-scraper which checks every page of your website for broken links, this is made for both developers and normal consumers.

## Salient features
- User authentication with email verification to keep scraped data private
- Automated scheduled testing feature using "node-cron"
- Detailed reports sent directly to email to reduce wait time and to save website owner's time 
- AI report with detailed solutions to each type of error occurring for the various broken links
- AI generated SEO rating for your website which directly shows how well suited your website is for SEOs
- RESTAPI interface for developers to access our scraper keeping load on their servers minimal

## For running locally

   To run this project locally, download and extract the files, now run the following commands
   
    cd frontend/my-reactapp
    npm install
    npm run dev
   
Now add and customize the .env file of following format in the backend folder,

    MONGO_URI=<mongoDB cluster connect URL>
    PORT=5000
    JWT_SECRET=<some password>
    EMAIL_SECRET=<some password>
    EMAIL_USERNAME=<Email address for sending mails>
    EMAIL_PASSWORD=<Email app password required for nodemailer>
    BACKEND_URL=http://localhost:5000
    AI_API_KEY=<Gemini AI API key>

   and finally for backend,
   

    cd backend
    npm install
    npm run dev
    
### The website should now be up and running

## We have also implemented a RESTAPI integration
So that other developers can use our web-scraper using API calls I have generated a RESTAPI interface,
### To generate an API key 
make a GET request to the server at endpoint "/api/getAPIkey",
now access the scrapper using the endpoint "/api/getStatusURL", including the following details in the POST request body

												   

    {
	    URL : <url to be scraped>,
	    API_KEY : <generated API key>
	    auth : <to bypass any custom authentication of the website>,
	    pages : <number of pages to be scraped>
	}

this will return data of following format,

    {
	    brokenLinks : [{ link, status, statusText, parent} or {link, error}],
	    checkedLinks : [{ link, status, statusText, parent}],
	    visitedURL : [links]
	    timeElapsed : (in seconds),
    }
