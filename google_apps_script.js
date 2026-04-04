// =====================================================================
// GOOGLE APPS SCRIPT FOR OKOK TECH BOOKINGS (V2 - WITH EMAIL AUTOMATION)
// =====================================================================
// INSTRUCTIONS TO UPDATE:
// 1. Open your Google Sheet in your browser.
// 2. In the top menu, click on "Extensions" > "Apps Script".
// 3. Delete the old code there and paste this entirely new file.
// 4. Click the "Save" icon (or File > Save).
// 5. Click the blue "Deploy" button at the top right, then **"New deployment"**. (Do NOT select Manage Deployments, you must create a new one).
// 6. Click the gear icon next to "Select type" and choose "Web app".
// 7. Under "Description", type something like "OKOK Bookings with Emails".
// 8. Under "Execute as", select "Me".
// 9. Under "Who has access", SELECT "Anyone".
// 10. Click "Deploy".
// 11. Read carefully: Because this new script sends emails, it will ask for **Google Permissions** again.
//     - Click "Review Permissions"
//     - Select your account
//     - Click "Advanced" at the bottom
//     - Click "Go to Untitled project (unsafe)"
//     - Click "Allow" so it can send emails on your behalf.
// 12. Copy the newly generated "Web app URL".
// 13. Open your script.js file and paste that NEW URL into the GOOGLE_SHEET_WEBHOOK_URL variable.
// =====================================================================

// By default, the script will send company alerts to the Google account that deployed this script.
// You can change COMPANY_EMAIL to a specific string like "mycompany@gmail.com" if you prefer.
var COMPANY_EMAIL = Session.getActiveUser().getEmail(); 

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse the incoming JSON data from the website
    var data = JSON.parse(e.postData.contents);
    
    // ---------------------------------------------------------
    // 1. SAVE TO GOOGLE SHEETS
    // ---------------------------------------------------------
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Name", "Time of booking", "Email id", "Service Name", "Description", "Phone"]);
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold");
    }
    
    sheet.appendRow([
      data.name || "",
      data.timestamp || "",
      data.email || "",
      data.service || "",
      data.message || "",
      data.phone || ""
    ]);

    // ---------------------------------------------------------
    // 2. EMAIL AUTOMATION
    // ---------------------------------------------------------
    if (data.email) {
      // Email A: Notification going to the USER confirming their request.
      var userSubject = "Booking Confirmation - OKOK Tech";
      var userBody = "Hi " + (data.name || "there") + ",\n\n" +
                     "Thank you for choosing OKOK Tech!\n\n" +
                     "This email is a confirmation that we have successfully received your service booking requested on " + (data.timestamp || "") + ".\n\n" +
                     "Booking Details:\n" +
                     "- Service: " + (data.service || "") + "\n" +
                     "- Description: " + (data.message || "No description provided.") + "\n\n" +
                     "Our team will securely review your request and get back to you shortly.\n\n" +
                     "Best regards,\nOKOK Tech Support Team";
                     
      MailApp.sendEmail({
        to: data.email,
        subject: userSubject,
        body: userBody,
        name: "OKOK Tech"
      });
      
      // Email B: Alert going to the COMPANY (You) indicating a new booking.
      var adminSubject = "New Service Booking - " + (data.name || "Client");
      var adminBody = "A new booking has just been submitted on your website!\n\n" +
                      "Client Details:\n" +
                      "Name: " + (data.name || "") + "\n" +
                      "Email: " + (data.email || "") + "\n" +
                      "Phone: " + (data.phone || "") + "\n\n" +
                      "Booking Details:\n" +
                      "Service: " + (data.service || "") + "\n" +
                      "Description: " + (data.message || "") + "\n" +
                      "Time requested: " + (data.timestamp || "") + "\n\n" +
                      "This data has also been saved to your attached Google Sheet automatically.";
                      
      MailApp.sendEmail({
        to: COMPANY_EMAIL,
        subject: adminSubject,
        body: adminBody,
        name: "OKOK Web System"
      });
    }

    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch(err) {
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}
