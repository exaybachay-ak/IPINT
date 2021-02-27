/** IPINT v2.0

    IPINT AUTHOR
    @author Jacob Kelley / exaybachay-ak
    https://github.com/exaybachay-ak/IPINT

        ORIGINAL DOMtoString CODE AUTHOR:
        @author Rob W <http://stackoverflow.com/users/938089/rob-w>
        Demo: var serialized_html = DOMtoString(document);

    Dec 2020 - v2.0 Updates:
    Improved user interface aesthetics
    Implemented Chrome Storage backend to save user determinations
    Refactored some code for efficiency and readability

*/


/** Global variables and Main function
**************************************
*   Initialize global variables and make async call to populate storage and inject iframes
*/
var DEBUG = false; // Set this to get more output for troubleshooting

// Main async call to populate storage and then inject iframes
(async () => {
    try {
        await populateStorage();
        main();
    } catch (e) {
        console.log("Failed.");
    }
})();

// Primary user data JSON array
storage = {"data":[]};

function syncChrome(jsonobj){
    if(DEBUG){
        console.log(JSON.stringify(jsonobj));
    }
    chrome.storage.sync.set(jsonobj, function() {
        console.log('Data successfully saved to the storage!');
    });  
}

async function populateStorage(){
    chrome.storage.sync.get(null, function(items){
        if(DEBUG){
            console.log(items);
            console.log(items.data.length);
        }
        // Check to see if user data exists.  If not, make one entry to initiate it
        if(typeof items.data === "undefined" || items.data.length === 0){
            var testobj = {"data":[{"ipaddress":"8.8.8.8","disposition":"isGood"}]};
            storage = testobj;
            syncChrome(testobj);
        } else {
            // If user data does exist, populate storage JSON array
            storage = items;
        }
    });
}

async function main() {
    // Note: Had to move sleep function to main() because it does not work at the global level
    //    if you close and reopen the extension, using the red x, followed by clicking the 
    //    extension icon
    const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
    await sleep(500); // Sleep function needed to wait for storage to populate from Google Storage API
    if(DEBUG){
        console.log("STORAGE ARRAY IS: " + JSON.stringify(storage));
    }

    /** Configure Chrome Storage API Functions
    ******************************************
    *   Mainly search functions for known IP addresses
    */
    function clearChromeStorage(){
        chrome.storage.sync.clear(function (){
            console.log('Cleared Chrome storage!');
        });
    }

    function setTextGlowColorInitial (ip,el) {
        if(DEBUG){
            console.log("Storage array contains: " + JSON.stringify(storage));
        }
        for(var item of storage.data){
            if(DEBUG){
                console.log(JSON.stringify(item));
            }
            if(item["ipaddress"] === ip){
                // Found the ip.. colorize the element
                if(item["disposition"] == "isGood"){
                    // Color good elements green
                    if(DEBUG){
                        console.log("Found IP in Chrome storage! Setting properties.");
                    }
                    $(el).css('text-shadow', '0 0 0.75em green, 0 0 0.75em green, 0 0 0.75em green');
                    $(el).css('color', '#8f8');
                    return true;
                } else {
                    // Color suspicious elements red
                    if(DEBUG){
                        console.log("Found IP in Chrome storage! Setting properties.");
                    }
                    $(el).css('text-shadow', '0 0 0.75em red, 0 0 0.75em red, 0 0 0.75em red');
                    $(el).css('color', 'red');
                    return true;
                }
            } else {
                // Pass
                console.log("Didn't find the IP in chrome storage");
            }
        }
        return false;
    }

    async function asyncFindIPinChromeStorageArray(ip,disp) {
        if(DEBUG){
            console.log("Searching storage array: " + JSON.stringify(storage));
            console.log("Passed IP Variable is: " + ip);
            console.log("Passed disposition variable is: " + disp);
        }
        
        for(var i=0;i<storage.data.length;i++){
            if(DEBUG){
                console.log("Checking item: " + JSON.stringify(storage.data[i]));
            }
            if(storage.data[i]["ipaddress"] === ip){
                console.log("We matched the IP Address!!!");
                if(storage.data[i]["disposition"] === disp){
                    // Both IP and Disposition are the same.. Don't do anything here
                    return true;
                } else {
                    // Matched IP but not disposition.  Need to delete so sync function can update info
                    if(DEBUG){
                        console.log("Deleting old data: " + storage.data[i]);
                    }
                    delete storage.data[i];
                    // Need to run filter to remove null entry that we just deleted
                    storage.data = storage.data.filter(function(x) { return x !== null });
                    return false;
                }
            } else {
                // Pass
            }            
        }
        return false;
    }

    async function asyncGetChromeStorageThenSyncArray(obj){
        if(DEBUG){
            console.log("info is " + JSON.stringify(obj));
            console.log("ip is: " + obj["ipaddress"]);
        }
        var found = await asyncFindIPinChromeStorageArray(obj["ipaddress"],obj["disposition"])
        console.log("Found variable is now: " + found);
        if(!found){
            if(DEBUG){
                console.log("PRE-UPDATE variable is: " + JSON.stringify(storage)) ;
            }
            storage.data.push(obj);
            syncChrome(storage);
            if(DEBUG){
                console.log("UPDATED Chrome Storage variable is: " + JSON.stringify(storage));
            }
        } else {
            console.log("Already added to IP DB.  Not adding.");
        }
    }

    function removeIPThenSyncArray(ip){
        if(DEBUG){
            console.log("Storage is: " + JSON.stringify(storage));
        }
        for(var i=0; i < storage.data.length; i++){
            if(storage.data[i]["ipaddress"] === ip){
                delete storage.data[i];
                // Need to run filter to remove null entry that we just deleted
                storage.data = storage.data.filter(function(x) { return x !== null });                
            }
        }
        if(DEBUG){
            console.log("Storage is now: " + JSON.stringify(storage));
        }
        syncChrome(storage);
    }

    //// ^^^ The above functions are for user data Chrome storage
    //////////////////////////////////////////////////////////////////////////////////////
    //// vvv Below are main functions for IPINT - injecting iframes and modifying elements

    function displayOsintIframe( context, url ){
        // Remove existing IPINT window(s) before showing current
        $('.windows').each(function() {
            $(this).remove();
        });

        // Create iframe
        var ipintIframe = document.createElement('iframe');
        ipintIframe.style.cssText = 'display\:none;position\:fixed;top\:65px;left\:220px;height\:87%;width\:85%;color\:white;background\:#666;overflow\:scroll;z-index\:0;box-shadow\:5px 5px 2\.5px #555555;border-radius\:6px;border\:2px solid gray;';
        ipintIframe.className = 'windows';
        ipintIframe.src = url;

        // Add TC iframe to document to make it visible
        document.body.appendChild(ipintIframe);

        // Show iFrame
        $(ipintIframe).css('z-index', '120000005');
        $(ipintIframe).css('display', 'unset');
    }

    function getVisibleText(s) {
        var SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
        while (SCRIPT_REGEX.test(s)) {
            s = s.replace(SCRIPT_REGEX, "");
        }
        var STYLE_REGEX = /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi;
        while (STYLE_REGEX.test(s)) {
            s = s.replace(STYLE_REGEX, "");
        }
        return s;
    }

    function setTextGlowColorOnClick(ipadd,dispo,elem){
        if(dispo === "isSuspicious"){
            $(elem).css('text-shadow', '0 0 0.75em red, 0 0 0.75em red, 0 0 0.75em red');
            $(elem).css('color', 'red');
        } 
        else if (dispo === "isGood") {
            $(elem).css('text-shadow', '0 0 0.75em green, 0 0 0.75em green, 0 0 0.75em green');
            $(elem).css('color', '#8f8');
        }
        else {
            // Do nothing
        }
    }

    function setClipboardPosition() {
      // Tweak clipboard position
      var divNum = document.querySelectorAll('.toggleDiv').length;
      var clipboardLeft = 255 + (divNum * 100);
      $('.clipboard').css('left', clipboardLeft);
    }


    /** Step 1 - DOMtoString
    ************************
    *   Read the current window into memory to review and use for updating window
    *   -this is where the action begins
    */

    function DOMtoString(document_root) {
        var html = '',
            node = document_root.firstChild;
        while (node) {
            switch (node.nodeType) {
            case Node.ELEMENT_NODE:
                html += getVisibleText( node.outerHTML );
                break;
            case Node.TEXT_NODE:
                html += getVisibleText( node.nodeValue );
                break;
            case Node.CDATA_SECTION_NODE:
                html += '<![CDATA[' + node.nodeValue + ']]>';
                break;
            case Node.COMMENT_NODE:
                html += '<!--' + node.nodeValue + '-->';
                break;
            case Node.DOCUMENT_TYPE_NODE:
                // (X)HTML documents are identified by public identifiers
                html += "<!DOCTYPE " + node.name + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '') + (!node.publicId && node.systemId ? ' SYSTEM' : '') + (node.systemId ? ' "' + node.systemId + '"' : '') + '>\n';
                break;
            }
            node = node.nextSibling;
        }

        /** Step 2 - Read IP Addresses From New String
        ******************************************
        *   Use data from current browser webpage to find IP addresses and investigate them
        */

        // Set up regex pattern and apply it against the current webpage, storing results in myArray
        var re = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}/g;
        var myArray = html.match(re);
        // Reduce the array and dedupe it
        var myArray = myArray.sort().filter(function(el,i,a){return i==a.indexOf(el);})


        // Adding functions for finding and removing ip array items
        
        // https://stackoverflow.com/questions/3954438/how-to-remove-item-from-array-by-value
        Array.prototype.remove = function() {
            var what, a = arguments, L = a.length, ax;
            while (L && this.length) {
                what = a[--L];
                while ((ax = this.indexOf(what)) !== -1) {
                    this.splice(ax, 1);
                }
            }
            return this;
        };


        // https://stackoverflow.com/questions/12695594/can-i-use-wildcards-when-searching-an-array-of-strings-in-javascript
        Array.prototype.find = function(regex) {
            var arr = this;
            var matches = arr.filter( function(e) { return regex.test(e); } );
            return matches.map(function(e) { return arr.indexOf(e); } );
        };


        // Remove any private IP addresses
        ipstoremove = [];
        var classAprivate = myArray.find(/\b10\..*\b/);
        var classBprivate = myArray.find(/\b172\.16\..*\b/);
        var classCprivate = myArray.find(/\b192\.168\..*\b/);
        var classDprivate = myArray.find(/\b240\..*\b/);

        // Loop each private range and add to list
        for (n = 0; n < classAprivate.length; n++){
            var addip = myArray[classAprivate[n]];
            ipstoremove.push(addip);
        }

        for (o = 0; o < classAprivate.length; o++){
            var addip = myArray[classBprivate[n]];
            ipstoremove.push(addip);
        }

        for (p = 0; p < classAprivate.length; p++){
            var addip = myArray[classCprivate[n]];
            ipstoremove.push(addip);
        }

        for (q = 0; q < classAprivate.length; q++){
            var addip = myArray[classDprivate[n]];
            ipstoremove.push(addip);
        }

        // Remove private IPs from main array list
        for(r = 0; r < ipstoremove.length; r++){
            myArray.remove(ipstoremove[r]);
        }

        // Inject breaks into DOM of IP addresses
        var newArray = myArray.join("\n");


        /** Step 3 - Add Overlay to Page (Left Side)
        ********************************************
        *   Make sidebar to control opening and closing OSINT frames
        */

        // Make DOM elements to bind array to
        // Add attributes for sidebar and its background config
        var newArrayDiv = document.createElement("div");
        var bgImage = chrome.extension.getURL("images/1.jpg");
        newArrayDiv.id = "newArrayDiv";
        newArrayDiv.style.cssText = 'overflow\:auto;z-index\:120000111;position\:fixed;top\:10px;left\:10px;height\:90%;width\:190px;padding-top\:25px;padding-left\:5px;padding-right\:5px;color\:white;background-color\:#0C4E6E;border-radius\:6px;border\:3px solid gray;box-shadow\:5px 5px 2\.5px #555555;font-family\:Arial;font-size\:12px;-webkit-font-smoothing\:antialiased;line-height\:17px';
        document.body.appendChild(newArrayDiv);

        // Add attributes to window for closing and closing image
        var closeButton = document.createElement("div");
        var buttonImage = chrome.extension.getURL("images/r2.png");
        closeButton.id = "closeButton";
        closeButton.style.cssText = 'cursor\:pointer;z-index\:120000000;position\:fixed;top\:10px;left\:10px;max-height\:25%;max-width\:25%;background-image\:url(' + buttonImage + ')';
        closeButton.title = "Close IPINT";
        var buttonImg = document.createElement("img");
        buttonImg.style.cssText = 'z-index\:120000002;position\:fixed;top\:15px;left\:15px;max-height\:2%;max-width\:2%';
        buttonImg.id = "buttonImage";
        buttonImg.src = buttonImage;

        // Add attributes to window transparency
        var transButton = document.createElement("div");
        var transImage = chrome.extension.getURL("images/b1.png");
        transButton.id = "transButton";
        transButton.style.cssText = 'cursor\:pointer;z-index\:120000000;position\:fixed;top\:10px;left\:150px;max-height\:25%;max-width\:25%;background-image\:url(' + transImage + ')';
        transButton.title = "Make Transparent";
        var transImg = document.createElement("img");
        transImg.style.cssText = 'z-index\:120000002;position\:fixed;top\:15px;left\:35px;max-height\:2%;max-width\:2%';
        transImg.id = "transImage";
        transImg.src = transImage;

        // Add button to clear Chrome storage
        var storageButton = document.createElement("button");
        storageButton.id = "storageButton";
        storageButton.style.cssText = 'cursor\:pointer;z-index\:120000000;position\:fixed;top\:15px;left\:55px;';
        storageButton.title = "Clear Storage";
        storageButton.innerText = "Clear Storage";
        $(storageButton).click(function() {
            clearChromeStorage();
            $('.toggleme').css('text-shadow', 'none');
            $('.toggleme').css('color', 'white');            
        });

        // Set function to close out sidebar and all divs
        $(buttonImg).click(function() {
            $('.windows, .toggleDiv, #newArrayDiv').each(function() {
                $(this).remove();
            });
            clipboard.remove();
        });

        // Set function to make divs transparent
        $(transImg).click(function() {
            if ( $(newArrayDiv).css('opacity') === ('0.33') ) {
                $('.windows, .toggleDiv, #newArrayDiv, #clipboard').each(function() {
                    $(this).css({ opacity: 1.0 });
                });
            } else {
                $('.windows, .toggleDiv, #newArrayDiv, #clipboard').each(function() {
                    $(this).css({ opacity: 0.33 });
                });
            }
        });

        // Attach close button and transparency to DOM
        document.getElementById("newArrayDiv").appendChild(closeButton);
        document.getElementById("closeButton").appendChild(buttonImg);
        document.getElementById("newArrayDiv").appendChild(transButton);
        document.getElementById("transButton").appendChild(transImg);
        document.getElementById("newArrayDiv").appendChild(storageButton);

        // Use IP array to generate text of IP addresses and add it to sidebar div
        for (i = 0;i < myArray.length; i++) {
            // Set up references and information about new P element
            var aipdbIframeName = "aipdbIframe" + i;
            var newArrayText = document.createElement("p");
            var newArrayTextName = "newArrayText" + i;
            var newArrayTextHandle = document.getElementById(newArrayTextName);
            newArrayText.id = newArrayTextName;
            newArrayText.innerText += myArray[i];
            newArrayText.className = "IPAddy";
            newArrayText.value += myArray[i];
            newArrayText.className = "toggleme";
            newArrayText.style.cssText = 'background-color\:transparent;cursor\:pointer';

            // Build isGood (green check) button div and image
            var isGoodButton = document.createElement("div");
            var isGoodImage = chrome.extension.getURL("images/green-check-icon.png");
            var isGoodButtonName = "isGoodButton" + i;
            isGoodButton.id = isGoodButtonName;
            isGoodButton.style.cssText = 'margin-left:10px;float\:right;z-index:120000112;';
            isGoodButton.title = "Mark this IP as good.";
            isGoodButton.className = "goodButton";
            var isGoodImg = document.createElement("img");
            isGoodImg.style.cssText = 'z-index:120000112';
            isGoodImg.id = "isGoodImage" + i;
            isGoodImg.src = isGoodImage;
            isGoodImg.className = "goodImage";

            // Set onClick event for adding IP to Chrome sync
            $(isGoodImg).click(function(){
                var trustedIP = this.parentElement.parentElement.innerText;
                if(DEBUG){
                    console.log("DEBUG: trustedIP is: " + trustedIP);
                }
                var ipobj = {"ipaddress":trustedIP,"disposition":"isGood"};
                asyncGetChromeStorageThenSyncArray(ipobj);
                setTextGlowColorOnClick(trustedIP,"isGood",this.parentElement.parentElement);
            });

            // Build isSuspect (red x) button div and image
            var isSuspectButton = document.createElement("div");
            var isSuspectImage = chrome.extension.getURL("images/red-x-icon.png");
            var isSuspectButtonName = "isSuspectButton" + i;
            isSuspectButton.id = isSuspectButtonName;
            isSuspectButton.style.cssText = 'margin-left:10px;float\:right;z-index:120000112';
            isSuspectButton.title = "Mark this IP as suspicious.";
            isSuspectButton.className = "suspectButton";
            var isSuspectImg = document.createElement("img");
            isSuspectImg.style.cssText = 'z-index:120000112';
            isSuspectImg.id = "isSuspectImage" + i;
            isSuspectImg.src = isSuspectImage;
            isSuspectImg.className = "suspectImage";

            // Set onClick event for adding IP to Chrome sync
            $(isSuspectImg).click(function(){
                var suspiciousIP = this.parentElement.parentElement.innerText;
                if(DEBUG){
                    console.log("DEBUG: suspiciousIP is: " + suspiciousIP);
                }
                var ipobj = {"ipaddress":suspiciousIP,"disposition":"isSuspicious"};
                asyncGetChromeStorageThenSyncArray(ipobj);
                setTextGlowColorOnClick(suspiciousIP,"isSuspicious",this.parentElement.parentElement);
            });

            // Build unsure (blue ?) button div and image
            var unsureButton = document.createElement("div");
            var unsureImage = chrome.extension.getURL("images/blue-questionmark-icon.png");
            var unsureButtonName = "unsureButton" + i;
            unsureButton.id = unsureButtonName;
            unsureButton.style.cssText = 'float\:right;z-index:120000112';
            unsureButton.title = "Remove this IP.";
            unsureButton.className = "unsureButton";
            var unsureImg = document.createElement("img");
            unsureImg.style.cssText = 'z-index:120000112';
            unsureImg.id = "unsureImage" + i;
            unsureImg.src = unsureImage;
            unsureImg.className = "unsureImage";

            // Set onClick event for adding IP to Chrome sync
            $(unsureImg).click(function(){
                var unsureIP = this.parentElement.parentElement.innerText;
                if(DEBUG){
                    console.log("DEBUG: unsure IP is: " + unsureIP);
                }
                removeIPThenSyncArray(unsureIP);
                var targetElem = this.parentElement.parentElement;
                $(targetElem).css('text-shadow', 'none');
                $(targetElem).css('color', 'white');
            });            

            // Attach newArrayText (IP Address info) first, so I can put images in later
            document.getElementById("newArrayDiv").appendChild(newArrayText);

            // Attach new images to paragraph, to arm with functions later
            document.getElementById(newArrayTextName).appendChild(isGoodButton);
            document.getElementById(isGoodButtonName).appendChild(isGoodImg);
            document.getElementById(newArrayTextName).appendChild(isSuspectButton);
            document.getElementById(isSuspectButtonName).appendChild(isSuspectImg);
            document.getElementById(newArrayTextName).appendChild(unsureButton);
            document.getElementById(unsureButtonName).appendChild(unsureImg);

            if(DEBUG){
                console.log("DEBUG: MyArray is populated with: " + myArray + ", and MyArray length is: " + myArray.length);
                console.log("setTextGlowColor: Setting Glow on: " + myArray[i]);
            }

            setTextGlowColorInitial(myArray[i],newArrayText);
        }

        /** Step 4 - Build Frame and Controls for Actual OSINT (Right Side)
        ********************************************************************
        *   Create and arm events to unhide OSINT iframes for analysis
        */
        $( ".toggleme" ).each(function(index) {
            $(this).on("click", function(){
                // Un-set other elements
                $('.toggleme').css('border-bottom', '0px solid white');

                // Set the active IP's color for reference
                $(this).css('border-bottom', '1px solid white');

                // Modify opacity back to 1, in case user clicks toggleme link from transparent mode
                $('#newArrayDiv').css('opacity','1.0');
                
                // Set up handles to access iframes and toggle divs to modify them
                var tmIframeNameToggle = "tmIframe" + index;
                var tmToggleNameToggle = "tmToggleDiv" + index;
                var tcIframeNameToggle = "tcIframe" + index;
                var tcToggleNameToggle = "tcToggleDiv" + index;
                var aipdbIframeNameToggle = "aipdbIframe" + index;
                var aipdbToggleNameToggle = "aipdbToggleDiv" + index;
                var rtIframeNameToggle = "rtIframe" + index;
                var rtToggleNameToggle = "rtToggleDiv" + index;
                // Attach handles to DOM, making elements visible
                var tmHandle = document.getElementById(tmIframeNameToggle);
                var tmToggleHandle = document.getElementById(tmToggleNameToggle);
                var tcHandle = document.getElementById(tcIframeNameToggle);
                var tcToggleHandle = document.getElementById(tcToggleNameToggle);
                var aipdbHandle = document.getElementById(aipdbIframeNameToggle);
                var aipdbToggleHandle = document.getElementById(aipdbToggleNameToggle);
                var rtHandle = document.getElementById(rtIframeNameToggle);
                var rtToggleHandle = document.getElementById(rtToggleNameToggle);

                // If topbar is loaded already, tear it down and close things out
                if ( $(tmToggleHandle).css('display') === ('unset') ){
                    $('.windows').each(function() {
                        $(this).css('display', 'none');
                    });

                    $('.clipboard').each(function() {
                        $(this).css('display', 'none');
                        $(this).remove();
                    });

                    $('.toggleDiv').each(function() {
                        $(this).css('display', 'none');
                        $(this).css('z-index', '0')
                    });

                    // Create text area to display current URL for copying
                    var clipboard = document.createElement("div");
                    clipboard.id = "clipboard";
                    clipboard.className = "clipboard";
                    clipboard.style.cssText = 'z-index\:120000111;position\:fixed;top\:13px;left\:525px;height\:33px;padding-top\:1px;padding-left\:10px;padding-right\:18px;box-shadow\:5px 5px 2\.5px #555555;color\:white;background-color\:#0C4E6E;border-radius\:6px;border\:3px solid gray;font-family\:Arial;font-size\:12px;-webkit-font-smoothing\:antialiased;line-height\:27px';
                    document.body.appendChild(clipboard);
                } else {
                    // If toolbar hasn't loaded yet, unhide the topnav for loading OSINT iframes and also pop out a virustotal window since you can't load VT in an iframe
                    // Hide all iframes and divs before loading the new batch, to avoid a user clicking one ip and then another without first toggling/closing the initial IP
                    $('.windows, .toggleDiv').each(function() {
                        $(this).remove();
                    });

                    $('.clipboard').each(function() {
                        $(this).css('display', 'none');
                        $(this).remove();
                    });

                    // Create text area to display current URL for copying
                    var clipboard = document.createElement("div");
                    clipboard.id = "clipboard";
                    clipboard.className = "clipboard";
                    clipboard.style.cssText = 'z-index\:120000111;position\:fixed;top\:13px;left\:525px;height\:33px;padding-top\:1px;padding-left\:10px;padding-right\:18px;box-shadow\:5px 5px 2\.5px #555555;color\:white;background-color\:#0C4E6E;border-radius\:6px;border\:3px solid gray;font-family\:Arial;font-size\:12px;-webkit-font-smoothing\:antialiased;line-height\:27px';
                    document.body.appendChild(clipboard);

                    // Set the clipboard text for copying
                    var tm = "https\://www\.threatminer\.org/host\.php?q=" + myArray[index];
                    clipboard.innerText = ""
                    clipboard.innerText = "https\://www\.threatminer\.org/host\.php?q=" + myArray[index];

                    // Set threatminer iframe
                    displayOsintIframe( this, 'https\://www\.threatminer\.org/host\.php?q=' + myArray[index] );

                    // Create class for instantiating toggle divs and onclick functionality
                    class toggleDiv {
                        constructor(prefix,website,innertext) {
                            // Set up the toggle div
                            var ToggleDiv = document.createElement('div');
                            // Var ToggleDivName = prefix + "IframeName";
                            var ToggleDivName = prefix + "ToggleDiv";
                            var ToggleDivText = document.createElement('p');
                            ToggleDiv.id = ToggleDivName;
                            ToggleDiv.name = ToggleDivName;
                            ToggleDiv.value = ToggleDivName;
                            // Count number of existing divs and adjust width accordingly
                            var divNum = document.querySelectorAll('.toggleDiv').length;
                            var divLeft = 220 + (divNum * 100);
                            var divZIndex = (divNum + 120000111);
                            // Set the actual DIV properties
                            ToggleDiv.style.cssText = 'cursor\:pointer;display\:unset;position\:fixed;top\:11px;left\:' + divLeft + 'px;height\:39px;width\:100px;color\:white;;z-index\:' + divZIndex + ';background-color\:#0C4E6E;margin\:5;padding-left\:10px;padding-right\:10px;border\:2px solid gray;box-shadow\:5px 5px 2\.5px #555555;font-family\:Arial;font-size\:12px;-webkit-font-smoothing\:antialiased;line-height\:35px'
                            ToggleDiv.className = 'toggleDiv';
                            // Set the text to append to this div
                            ToggleDiv.innerText += innertext;
                            // Attach the DIV to the webpage
                            document.body.appendChild(ToggleDiv);
                            document.getElementById(ToggleDivName).appendChild(ToggleDivText);

                            $('#' + ToggleDivName).on("click", function() {
                                displayOsintIframe( this, website + myArray[index] );
                                // Clear current clipboard contents before adding new info
                                clipboard.innerText = "";
                                // Add URL to clipboard div for copying
                                clipboard.innerText += website + myArray[index];
                            });
                        }
                    }

                    // Set threatminer toggle div class object
                    tmdiv = new toggleDiv('tm','https://www.threatminer.org/host.php?q=','ThreatMiner');
                    // Set the default threatminer top nav text shadow
                    $('#tmToggleDiv').css('text-shadow', '0 0 0.75em silver, 0 0 0.75em silver, 0 0 0.75em silver');

                    // Set robtex toggle div class object
                    rtdiv = new toggleDiv('rt','https://www.robtex.com/?dns=','robtex');

                    // Set threatminer toggle div class object
                    tcdiv = new toggleDiv('tc','https://www.threatcrowd.org/ip.php?ip=','ThreatCrowd');

                    // Put the clipboard div after all OSINT divs
                    setClipboardPosition();

                    // Clear glow and set on active toggle div
                    $('.toggleDiv').each(function() {
                        $(this).on("click", function(){
                            $('.toggleDiv').each(function() {
                                $(this).css('text-shadow', 'none');
                            });
                            $(this).css('text-shadow', '0 0 0.75em silver, 0 0 0.75em silver, 0 0 0.75em silver');                            
                        });
                    });

                    // Unhide OSINT service toggle divs
                    $('.windows').each(function() {
                        $(tmHandle).css('display', 'unset');
                        $(tmHandle).css('z-index', '120000111');

                        $('.toggleDiv').each(function() {
                            $(this).css('display', 'unset');
                            $(this).css('z-index', '120000001');
                            $(this).css('cursor', 'pointer');
                        });
                    });
                };
                return newArray;
            });
        });
    }

    // Assuming newArrayDiv doesn't exist, so we send a message to create it
    var sidebarExists = document.getElementById("newArrayDiv");
    if ( !sidebarExists ){
        // Get info about document and inject iframes
        chrome.runtime.sendMessage({
            action: "   ",
            source: DOMtoString(document)
        });
    } 
}
