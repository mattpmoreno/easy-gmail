import {packageName} from "./global.constants";
import {Utils} from "./utils";
import {SendEmail} from "./send-email";

const fs = require('fs');
const {google} = require('googleapis');

export class EasyGmail {
  // The gmail client
  public gmailClient: any;
  // Storing html templates used so we dont have to keep parsing them
  public htmlTemplates: {[key: string]: any} = {};
  constructor(credsPath: string, tokenPath: string, public userID: string) {
    this.gmailClient = EasyGmail.setupGmailClient(credsPath, tokenPath);
  }
  /****************************************************************************************
  * Initialization
  ****************************************************************************************/
  /**
   * @function
   * @description
   * Factory to create a new easy gmail class object
   * @param credsPath {string} path to credentials.json
   * @param tokenPath {string} path to token.json
   * @param userID {string} ID used in setting up the gmail authorization
   * @return {EasyGmail} new easy gmail object
   **/
  public static easyGmailFactory(credsPath: string, tokenPath: string, userID: string): EasyGmail {
    return new EasyGmail(credsPath, tokenPath, userID);
  }
  /**
   * @method
   * @description
   * Sets up the gmail client we are going to use
   * @param credsPath {string} path to credentials.json
   * @param tokenPath {string} path to token.json
   * @return {any} returns the gmail client used in this object
  **/
  private static setupGmailClient(credsPath: string, tokenPath: string): any {
    // Need to get our credentials and token first
    const creds: any = Utils.loadJSONFile(credsPath);
    const token: any = Utils.loadJSONFile(tokenPath);
    // Grab the credential details
    // eslint-disable-next-line @typescript-eslint/camelcase
    const {client_secret, client_id, redirect_uris} = creds.installed;
    // Then we set up the google authentication through OAuth2
    const googleAuth = new google.auth.OAuth2(
      // eslint-disable-next-line @typescript-eslint/camelcase
      client_id, client_secret, redirect_uris[0]
    );
    // Then pass the token into our google auth to finish authentication
    googleAuth.setCredentials(token);
    // And setup our gmail client
    return google.gmail({version: 'v1', auth: googleAuth});
  }
  /****************************************************************************************
  * Sending Emails Interface
  ****************************************************************************************/
  /**
   * @method
   * @description
   * Sends email containing text only body
   * @param fromEmail {string} address the email is sent from
   * @param toEmail {string} address the email is sent to
   * @param subject {string} subject line of the email
   * @param bodyText {string} text in the body of the email
   * @return {Promise<boolean>} promise telling us whether sending was successful or not
  **/
  public sendTextEmail(
    fromEmail: string,
    toEmail: string,
    subject: string,
    bodyText: string
  ): Promise<boolean> {
    return SendEmail.sendEmail(
      {from: fromEmail, to: toEmail, subject: subject, bodyText: bodyText},
      this.userID,
      this.gmailClient
    );
  }
  /**
   * @method
   * @description
   * Sends email containing text only body
   * @param fromEmail {string} address the email is sent from
   * @param toEmail {string} address the email is sent to
   * @param subject {string} subject line of the email
   * @param htmlPath {string} path to the html template
   * @param htmlTagsToText {[key: string]: string} mapping of tags to text to replace the tags
   * @return {Promise<boolean>} promise telling us whether sending was successful or not
  **/
  public sendHtmlEmail(
    fromEmail: string,
    toEmail: string,
    subject: string,
    htmlPath: string,
    htmlTagsToText: {[key: string]: string}
  ): Promise<boolean> {
    return SendEmail.sendEmail(
      {
        from: fromEmail, to: toEmail, subject: subject,
        // Need to process html first
        html: EasyGmail.replaceTagsWithText(this.getOrCreateHtmlObject(htmlPath), htmlTagsToText)
      },
      this.userID,
      this.gmailClient
    );
  }
  /**
   * @method
   * @description
   * Gets or creates a new html template object
   * @param htmlPath {string} the path to the html file
   * @return {string} the html template as a string
  **/
  private getOrCreateHtmlObject(htmlPath: string): string {
    // We check if we already have this template in memory
    if (this.htmlTemplates[htmlPath] !== undefined) {
      // if we do then we return what we have
      return this.htmlTemplates[htmlPath];
    }
    // Otherwise we grab the html template and stash it here
    let html: string = '';
    try {
      html = fs.readFileSync(htmlPath, {encoding: 'utf8'});
      this.htmlTemplates[htmlPath] = html;
    } catch(e) {
      throw packageName + ': Cannot load html template at path: ' + htmlPath;
    }
    return html;
  }
  /**
   * @method
   * @description
   * Goes through HTML template string and replaces the given tags with the given text
   * @param htmlTemplate {string} the html template where we are replacing tags
   * @param htmlTagsToText {[key: string]: string} mapping of tags and the text used to replace them
   * @return {string} new html template with tags replaced
  **/
  private static replaceTagsWithText(htmlTemplate: string, htmlTagsToText: { [key: string]: string }): string {
    // Go through and replace each tag in the html template with the appropriate text
    for (const [key, value] of Object.entries(htmlTagsToText)) {
      htmlTemplate = htmlTemplate.replace(key, value);
    }
    return htmlTemplate;
  }
}
