# Why does this exist?
The [Google docs for setting up Gmail authorization](https://developers.google.com/gmail/api/quickstart/nodejs) are very clear. However, once you're authorized, you're kind of on your own. Hopefully, this package will make it easier to get up and running with Gmail in your node apps.

# Setup

1. Follow the instructions at the link above to set up the authorization files (one is called token.json and one is called credentials.json).
2. **Module Setup:** There's some small setup necessary to begin using this package:


    // Setup directly from the module import
    // This requires:
    //   - local path to the token.json file
    //   - local path to the credentials.json file
    //   - userID used in setting up the auth
    //     (usually an email address)
    // If you want to reuse these same creds, export and import
    // easyGmail object when you want to use it
    const easyGmail = require('easy-gmail').easyGmail(
        credentialsPath,
        tokenPath,
        userID
    );
3. **Sending An Email (Text Only):**


    // Get the object you just created
    import {easyGmail} from './wherever-you-put-this';
    ...
    // Sending text only emails are pretty simple
    easyGmail.sendTextEmail(
        fromEmail,
        toEmail,
        subject,
        bodyText
    ).then(
        () => {/*Success goes here*/},
        (err) => {/*Error goes here*/}
    );
4. **Sending An Email (HTML Template):**


    // Get the object you created in step (2)
    import {easyGmail} from './wherever-you-put-this';
    ...
    // When sending an html email, give the local path to the 
    // html template.
    // You can optionally include an object mapping 'tags' to
    // text you want to replace it with. E.g. you can include
    // the name of the user you are emailing with
    // {'$$first-name$$': userFirstName} and it will replace any
    // text in the html template matching $$first-name$$
    // with the string in userFirstName.
    easyGmail.sendHtmlEmail(
        fromEmail,
        toEmail,
        subject,
        htmlPath,
        replaceTagsWithText
    ).then(
        () => {/*Success goes here*/},
        (err) => {/*Error goes here*/}
    );
