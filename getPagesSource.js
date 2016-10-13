/** IPINT v1.0
    ORIGINAL DOMtoString CODE AUTHOR:
    @author Rob W <http://stackoverflow.com/users/938089/rob-w>
    Demo: var serialized_html = DOMtoString(document);
    New IPINT Overlay AUTHOR
    @author Jacob Kelley / exaybachay 
*** Step 1
*   Read the current window into memory to review and use for updating window
*/
function DOMtoString(document_root) {
    var html = '',
        node = document_root.firstChild;
    while (node) {
        switch (node.nodeType) {
        case Node.ELEMENT_NODE:
            html += node.outerHTML;
            break;
        case Node.TEXT_NODE:
            html += node.nodeValue;
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

    /** Step 2
    *   Use data from current browser webpage to find IP addresses and investigate them
    *
    *   Step 2a
    *   Set up regex pattern and apply it against the current webpage, storing results in myArray 
    */
    var re = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}/g;
    var myArray = html.match(re);
    //reduce the array and dedupe it
    var myArray = myArray.sort().filter(function(el,i,a){return i==a.indexOf(el);})

    /** Step 2b
    *   Inject breaks into DOM of IP addresses 
    */
    var newArray = myArray.join("\n");
    
    /** Step 3
    *   Add OSINT iframes and load pages 
    *
    *   Step 3a
    *   Loop through matched IP addresses and allocate Iframes for later display
    */
    for (h = 0; h < myArray.length; h++) {
        //set website targets using matched IP address information to set URLs
        var tm = "https://www.threatminer.org/host.php?q=" + myArray[h];
        var tc = "https\://www\.threatcrowd\.org/ip\.php?ip=" + myArray[h];
        var abuseipdb = "https\://www\.abuseipdb\.com/check/" + myArray[h];
        var vt = "https://www.virustotal.com/en/ip-address/" + myArray[h]; + "/Information/"
        var bgImage = chrome.extension.getURL("images/1.jpg");
    
        //set threatminer iframe
        var tmIframeName = "tmIframe" + h;
        var tmWindow = document.createElement('iframe');
        tmWindow.id = tmIframeName;
        tmWindow.value = tmIframeName;
        tmWindow.style.cssText = 'position\:fixed;top\:52px;left\:187px;height\:709px;width\:85%;color\:white;background\:#666;display\:none;overflow\:scroll;z-index\:0;border-radius\:6px;border\:2px solid gray;box-shadow\:5px 5px 2\.5px #555555;';
        tmWindow.className = 'windows';
        tmWindow.src = tm;

        //set threatminer toggle div
        var tmToggleDiv = document.createElement('div');
        var tmToggleDivName = "tmToggleDiv" + h;
        var tmToggleDivText = document.createElement('p');
        tmToggleDiv.id = tmToggleDivName;
        tmToggleDiv.Name = tmToggleDivName;
        tmToggleDiv.value = tmToggleDivName;
        tmToggleDiv.style.cssText = 'position\:fixed;top\:11px;left\:187px;height\:39px;width\:100px;color\:white;opacity\:0\.0;z-index\:0;background-color\:transparent;background-image\:url(' + bgImage + ');margin\:5;padding-left\:10px;padding-right\:10px;border-top-left-radius\:6px;border-bottom-left-radius\:6px;border\:2px solid gray;box-shadow\:5px 5px 2\.5px #555555;font-family\:Arial;font-size\:12px;-webkit-font-smoothing\:antialiased;line-height\:17px';
        tmToggleDiv.className = 'toggletmDiv';
        //set the text to append to this div
        tmToggleDivText.innerText += "ThreatMiner";
        //attach the DIV to the webpage
        document.body.appendChild(tmToggleDiv);
        document.getElementById(tmToggleDivName).appendChild(tmToggleDivText);

        //set threatcrowd iframe
        var tcIframeName = "tcIframe" + h;
        var tcWindow = document.createElement('iframe');
        tcWindow.id = tcIframeName;
        tcWindow.value = tcIframeName;
        tcWindow.style.cssText = 'position\:fixed;top\:52px;left\:187px;height\:709px;width\:85%;color\:white;background\:#666;opacity\:0\.0;overflow\:scroll;z-index\:0;border-radius\:6px;border\:2px solid gray;box-shadow\:5px 5px 2\.5px #555555;';
        tcWindow.className = 'windows';
        tcWindow.src = tc;

        //set threatcrowd toggle div
        var tcToggleDiv = document.createElement('div');
        var tcToggleDivName = "tcToggleDiv" + h;
        var tcToggleDivText = document.createElement('p');
        tcToggleDiv.id = tcToggleDivName;
        tcToggleDiv.Name = tcToggleDivName;
        tcToggleDiv.value = tcToggleDivName;
        tcToggleDiv.style.cssText = 'position\:fixed;top\:11px;left\:287px;height\:39px;width\:100px;color\:white;opacity\:0\.0;background-color\:transparent;border-radius\:6;background-image\:url(' + bgImage + ');margin\:5;padding-left\:10px;padding-right\:10px;border\:2px solid gray;box-shadow\:5px 5px 2\.5px #555555;font-family\:Arial;font-size\:12px;-webkit-font-smoothing\:antialiased;line-height\:17px';
        tcToggleDiv.className = 'toggletcDiv';
        //set the text to append to this div
        tcToggleDivText.innerText += "ThreatCrowd";
        //attach the DIV to the webpage
        document.body.appendChild(tcToggleDiv);
        document.getElementById(tcToggleDivName).appendChild(tcToggleDivText);
        
        //set abuseipdb iframe
        var aipdbIframeName = "aipdbIframe" + h;
        var aipdbWindow = document.createElement('iframe');
        aipdbWindow.id = aipdbIframeName;
        aipdbWindow.value = aipdbIframeName;
        aipdbWindow.style.cssText = 'position\:fixed;top\:52px;left\:187px;height\:709px;width\:85%;color\:white;background\:#666;opacity\:0\.0;overflow\:scroll;z-index\:0;border-radius\:6px;border\:2px solid gray;box-shadow\:5px 5px 2\.5px #555555;';
        aipdbWindow.className = 'windows';
        aipdbWindow.src = abuseipdb;
      
        //set abuseipdb toggle div
        var aipdbToggleDiv = document.createElement('div');
        var aipdbToggleDivName = "aipdbToggleDiv" + h;
        var aipdbToggleDivText = document.createElement('p');
        aipdbToggleDiv.id = aipdbToggleDivName;
        aipdbToggleDiv.Name = aipdbToggleDivName;
        aipdbToggleDiv.value = aipdbToggleDivName;
        var bgImage = chrome.extension.getURL("images/1.jpg");
        aipdbToggleDiv.style.cssText = 'position\:fixed;top\:11px;left\:387px;height\:39px;width\:100px;color\:white;opacity\:0\.0;z-index\:0;background-color\:transparent;border-radius\:6;background-image\:url(' + bgImage + ');margin\:5;padding-left\:10px;padding-right\:10px;border-top-right-radius\:6px;border-bottom-right-radius\:6px;border\:2px solid gray;box-shadow\:5px 5px 2\.5px #555555;font-family\:Arial;font-size\:12px;-webkit-font-smoothing\:antialiased;line-height\:17px';
        aipdbToggleDiv.className = 'toggleAIPDBDiv';
        //set the text to append to this div
        aipdbToggleDivText.innerText += "AbuseIPDB";
        //attach the DIV to the webpage
        document.body.appendChild(aipdbToggleDiv);
        document.getElementById(aipdbToggleDivName).appendChild(aipdbToggleDivText);
                
        //attach iframes to document
        document.body.appendChild(aipdbWindow);
        document.body.appendChild(tcWindow);
        document.body.appendChild(tmWindow);
        document.getElementById(aipdbIframeName).name = aipdbIframeName;
        document.getElementById(tcIframeName).name = tcIframeName;
        document.getElementById(tmIframeName).name = tmIframeName;
    }

    /** Step 4
    *   Make sidebar to control opening and closing OSINT frames
    */
    //make DOM elements to bind array to
    var newArrayDiv = document.createElement("div");
    var bgImage = chrome.extension.getURL("images/1.jpg");
    newArrayDiv.id = "newArrayDiv";
    newArrayDiv.style.cssText = 'z-index\:120000111;position\:fixed;top\:10px;left\:10px;height\:755px;width\:175px;padding-top\:25px;padding-left\:10px;color\:white;background-color\:transparent;border-radius\:6px;border\:3px solid gray;background-image\:url(' + bgImage + ');box-shadow\:1px 1px 0\.5px #555555;font-family\:Arial;font-size\:12px;-webkit-font-smoothing\:antialiased;line-height\:17px';
    document.body.appendChild(newArrayDiv);

    //add attributes to window for closing and background config
    var closeButton = document.createElement("div");
    var buttonImage = chrome.extension.getURL("images/r1.png");
    closeButton.id = "closeButton";
    closeButton.style.cssText = 'z-index\:120000000;position\:fixed;top\:10px;left\:10px;max-height\:25%;max-width\:25%;background-image\:url(' + buttonImage + ')';
    var buttonImg = document.createElement("img");
    buttonImg.style.cssText = 'z-index\:120000002;position\:fixed;top\:15px;left\:15px;max-height\:2%;max-width\:2%';
    buttonImg.id = "buttonImage";
    buttonImg.src = buttonImage;
    
    //Set function to close out sidebar
    $(buttonImg).click(function() {
        $(newArrayDiv).css('z-index', '0');
        $(newArrayDiv).css('display', 'none');
 
        $('.windows').each(function() {
            $(this).css('display', 'none');
        });

        $('.toggletmDiv').each(function() {
            $(this).css('display', 'none');
        });

        $('.toggletcDiv').each(function() {
            $(this).css('display', 'none');
        });

        $('.toggleAIPDBDiv').each(function() {
            $(this).css('display', 'none');
        });
    });

    //attach close button to DOM
    document.getElementById("newArrayDiv").appendChild(closeButton);
    document.getElementById("closeButton").appendChild(buttonImg);
    
    //use IP array to generate text of IP addresses and add it to sidebar div
    for (i = 0;i < myArray.length; i++) {
        var aipdbIframeName = "aipdbIframe" + i;

        var newArrayText = document.createElement("p");
        var newArrayTextName = "newArrayText" + i;
        newArrayText.id = newArrayTextName;
        newArrayText.innerText += myArray[i];
        newArrayText.className = "IPAddy";
        newArrayText.value += myArray[i];
        newArrayText.className = "toggleme";
        newArrayText.style.cssText = 'background-color:transparent';
        document.getElementById("newArrayDiv").appendChild(newArrayText);
    }

    /** Step 6 
    *   Create and arm events to unhide OSINT iframes for analysis
    */
    $( ".toggleme" ).each(function(index) {
        $(this).on("click", function(){
            //un-set other elements
            $('.toggleme').css('border-bottom', '0px solid white');
            $('.toggleme').css('text-shadow', '0 0 0 #fff, 0 0 0 #fff, 0 0 0 #fff');

            //set the active IP's color for reference
            $(this).css('border-bottom', '1px solid white');
            $(this).css('text-shadow', '0 0 0.25em #f00, 0 0 0.25em #f00, 0 0 0.25em #f00');
            
            //set up handles to access iframes and toggle divs to modify them
            var tmIframeNameToggle = "tmIframe" + index;
            var tmToggleNameToggle = "tmToggleDiv" + index;
            var tcIframeNameToggle = "tcIframe" + index;
            var tcToggleNameToggle = "tcToggleDiv" + index;
            var aipdbIframeNameToggle = "aipdbIframe" + index;
            var aipdbToggleNameToggle = "aipdbToggleDiv" + index;
            //attach handles to DOM, making elements visible
            var tmHandle = document.getElementById(tmIframeNameToggle);
            var tmToggleHandle = document.getElementById(tmToggleNameToggle);
            var tcHandle = document.getElementById(tcIframeNameToggle);
            var tcToggleHandle = document.getElementById(tcToggleNameToggle);
            var aipdbHandle = document.getElementById(aipdbIframeNameToggle);
            var aipdbToggleHandle = document.getElementById(aipdbToggleNameToggle);
            //initialize virustotal URL for window loading
            var virusTotal = "https://www.virustotal.com/en/ip-address/" + myArray[index] + "/information/";
            
            //if topbar is loaded already, tear it down and close things out
            if ( $(tmToggleHandle).css('display') === 'unset' ){
                
                $('.windows').each(function() {
                    $(this).css('display', 'none');
                });

                $(tmHandle).css('display', 'none');
                $(tmHandle).css('z-index', '0');
                $(tmToggleHandle).css('display', 'none');
                $(tmToggleHandle).css('z-index', '0');

                $(tcHandle).css('display', 'none');
                $(tcHandle).css('z-index', '0');
                $(tcToggleHandle).css('display', 'none');
                $(tcToggleHandle).css('z-index', '0');
                
                $(aipdbHandle).css('display', 'none');
                $(aipdbHandle).css('z-index', '0');
                $(aipdbToggleHandle).css('display', 'none');
                $(aipdbToggleHandle).css('z-index', '0');                
            }
            //if toolbar hasn't loaded yet, unhide the topnav for loading OSINT iframes and also pop out a virustotal window since you can't load VT in an iframe
            else {
                window.open(virusTotal, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,top=75,left=1300,width=483,height=860");

                //hide all iframes and divs before loading the new batch, to avoid a user clicking one ip and then another without first toggling/closing the initial IP
                $('.windows').each(function() {
                    $(this).css('display', 'none');
                });

                $('.toggletmDiv').each(function() {
                    $(this).css('display', 'none');
                });

                $('.toggletcDiv').each(function() {
                    $(this).css('display', 'none');
                });

                $('.toggleAIPDBDiv').each(function() {
                    $(this).css('display', 'none');
                });

                $('.windows').each(function() {
                    $(tmHandle).css('display', 'unset');
                    $(tmHandle).css('z-index', '120000000');

                    $(tmToggleHandle).css('display', 'unset');
                    $(tmToggleHandle).css('z-index', '120000000');

                    $(tcToggleHandle).css('display', 'unset');
                    $(tcToggleHandle).css('z-index', '120000000');
                    
                    $(aipdbToggleHandle).css('display', 'unset');
                    $(aipdbToggleHandle).css('z-index', '120000000');                    
                });
            };

            //if user clicks on the ThreatMiner div, hide all other iframes and display the TM OSINT
            $('.toggletmDiv').each(function(n) {
                $(this).on("click", function(o) {
                    $('.windows').each(function(p) {
                        $(this).css('z-index', '0');
                        $(this).css('display', 'none');
                    });    
                    
                    $(tmHandle).css('z-index', '120000002');
                    $(tmHandle).css('display', 'unset');
                })
            });

            //if user clicks on the ThreatCrowd div, hide all other iframes and display the TC OSINT        
            $('.toggletcDiv').each(function(k) {
                $(this).on("click", function(l) {
                    $('.windows').each(function(m) {
                        $(this).css('z-index', '0');
                        $(this).css('display', 'none');
                    });    
                    
                    $(tcHandle).css('z-index', '120000001');
                    $(tcHandle).css('display', 'unset');
                })                
            });

            //if user clicks on the AbuseIPDB div, hide all other iframes and display the AIPDB OSINT
            $('.toggleAIPDBDiv').each(function(h) {
                $(this).on("click", function(i) {
                    $('.windows').each(function(j) {
                        $(this).css('z-index', '0');
                        $(this).css('display', 'none');
                    });
                    
                    $(aipdbHandle).css('z-index', '120000000');
                    $(aipdbHandle).css('display', 'unset');
                }) 
            }); 
        });
    });
    
    return newArray;
}

chrome.runtime.sendMessage({
    action: "getSource",
    source: DOMtoString(document)
});