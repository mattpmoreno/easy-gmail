import {packageName} from "./global.constants";

const MailComposer = require('nodemailer/lib/mail-composer');

export interface EmailInputs {
  from: string,
  to: string,
  subject: string;
  bodyText?: string;
  html?: string;
}

export class SendEmail {
  /****************************************************************************************
  * Sending Email Interface
  ****************************************************************************************/
  /**
   * @method
   * @description
   * Sends a text email object
   * @param emailInputs {EmailInputs} inputs for the email object
   * @param userID {string} user ID used in gmail auth
   * @param gmailClient {any} the gmail client
   * @return {Promise<boolean>} whether it was sent successfully
  **/
  public static sendEmail(emailInputs: EmailInputs, userID: string, gmailClient: any): Promise<boolean> {
    // First we need to determine what kind of email we are creating and make it
    let precompiledEmail: any;
    if (emailInputs.bodyText !== undefined) {
      precompiledEmail = this.makeTextEmail(emailInputs);
    } else if (emailInputs.html !== undefined) {
      precompiledEmail = this.makeHtmlEmail(emailInputs);
    } else {
      // otherwise we need to throw because inputs arent configured correctly
      throw packageName + ': cannot send email because inputs are not configured correctly.';
    }
    // Then we need to compile and build it
    return precompiledEmail.compile().build((err: any, msg: any) => {
      if (err) {
        console.log(packageName + ': Error compiling email ' + err);
        return false;
      }
      // Need to do some encoding and replacement of text
      let encodedEmail = Buffer.from(msg)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      // Then we can send it
      return gmailClient.users.messages.send(
        {userId: userID, resource: {raw: encodedEmail}},
        (err: any, res: any) => {
          if (err) {
            console.log(packageName + ': Could not send email: ' + err);
            return false;
          }
          if (res) {return true;}
        }
      );
    });
  }
  /****************************************************************************************
  * Making Email Objects
  ****************************************************************************************/
  /**
   * @method
   * @description
   * Makes an email from an html string
   * @param emailInputs {EmailInputs} inputs for the email
   * @return {MailComposer} mail composer object used to compile the email
  **/
  private static makeHtmlEmail(emailInputs: EmailInputs): any {
    return new MailComposer({
      from: emailInputs.from,
      to: emailInputs.to,
      subject: emailInputs.subject,
      textEncoding: 'base64',
      html: emailInputs.html
    });
  }
  /**
   * @method
   * @description
   * Makes an email from an text string
   * @param emailInputs {EmailInputs} inputs for the email
   * @return {MailComposer} mail composer object used to compile the email
   **/
  private static makeTextEmail(emailInputs: EmailInputs): any {
    return new MailComposer({
      from: emailInputs.from,
      to: emailInputs.to,
      subject: emailInputs.subject,
      textEncoding: 'base64',
      text: emailInputs.bodyText
    });
  }
}