/** IPINT v2.0
    New IPINT Overlay AUTHOR
    @author Jacob Kelley / exaybachay

    ORIGINAL DOMtoString CODE AUTHOR:
    @author Rob W <http://stackoverflow.com/users/938089/rob-w>
    Demo: var serialized_html = DOMtoString(document);
*/

//*** General use functions
function displayOsintIframe( context, url ){
    // Remove existing IPINT window(s) before showing current
    $('.windows').each(function() {
        $(this).remove();
    });

    //Create iframe
    var ipintIframe = document.createElement('iframe');
    ipintIframe.style.cssText = 'display\:none;position\:fixed;top\:65px;left\:205px;height\:730px;width\:85%;color\:white;background\:#666;overflow\:scroll;z-index\:0;box-shadow\:5px 5px 2\.5px #555555;border-radius\:6px;border\:2px solid gray;';
    ipintIframe.className = 'windows';
    ipintIframe.src = url;

    //add TC iframe to document to make it visible
    document.body.appendChild(ipintIframe);

    //turn off red text glow before setting it on current div
    $('.toggleDiv').each(function() {
        $(this).css('text-shadow', 'none');
    });
    $(context).css('text-shadow', '0 0 0.25em #f00, 0 0 0.25em #f00, 0 0 0.25em #f00');

    //show iFrame
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

function setClipboardPosition() {
  //tweak clipboard position
  var divNum = document.querySelectorAll('.toggleDiv').length;
  var clipboardLeft = 225 + (divNum * 125);
  $('.clipboard').css('left', clipboardLeft);
}

/*
*** Step 1
**********
*   Read the current window into memory to review and use for updating window
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

    /** Step 2
    **********
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
    **********
    *   Make sidebar to control opening and closing OSINT frames
    */
    //make DOM elements to bind array to
    //add attributes for sidebar and its background config
    var newArrayDiv = document.createElement("div");
    var bgImage = chrome.extension.getURL("images/1.jpg");
    newArrayDiv.id = "newArrayDiv";
    newArrayDiv.style.cssText = 'overflow\:auto;z-index\:120000111;position\:fixed;top\:10px;left\:10px;height\:759px;width\:175px;padding-top\:25px;padding-left\:10px;color\:white;background-color\:#0C4E6E;border-radius\:6px;border\:3px solid gray;box-shadow\:5px 5px 2\.5px #555555;font-family\:Arial;font-size\:12px;-webkit-font-smoothing\:antialiased;line-height\:17px';
    document.body.appendChild(newArrayDiv);

    //add attributes to window for closing and closing image
    var closeButton = document.createElement("div");
    var buttonImage = chrome.extension.getURL("images/r2.png");
    closeButton.id = "closeButton";
    closeButton.style.cssText = 'cursor\:pointer;z-index\:120000000;position\:fixed;top\:10px;left\:10px;max-height\:25%;max-width\:25%;background-image\:url(' + buttonImage + ')';
    var buttonImg = document.createElement("img");
    buttonImg.style.cssText = 'z-index\:120000002;position\:fixed;top\:15px;left\:15px;max-height\:2%;max-width\:2%';
    buttonImg.id = "buttonImage";
    buttonImg.src = buttonImage;

    //add attributes to window transparency
    var transButton = document.createElement("div");
    var transImage = chrome.extension.getURL("images/b1.png");
    transButton.id = "transButton";
    transButton.style.cssText = 'cursor\:pointer;z-index\:120000000;position\:fixed;top\:10px;left\:150px;max-height\:25%;max-width\:25%;background-image\:url(' + transImage + ')';
    var transImg = document.createElement("img");
    transImg.style.cssText = 'z-index\:120000002;position\:fixed;top\:15px;left\:35px;max-height\:2%;max-width\:2%';
    transImg.id = "transImage";
    transImg.src = transImage;

    //Set function to close out sidebar and all divs
    $(buttonImg).click(function() {
        $('.windows, .toggleDiv, #newArrayDiv').each(function() {
            $(this).remove();
        });
        clipboard.remove();
    });


    //Set function to make divs transparent
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


    //attach close button and transparency to DOM
    document.getElementById("newArrayDiv").appendChild(closeButton);
    document.getElementById("closeButton").appendChild(buttonImg);
    document.getElementById("newArrayDiv").appendChild(transButton);
    document.getElementById("transButton").appendChild(transImg);

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
        newArrayText.style.cssText = 'background-color\:transparent;cursor\:pointer';
        document.getElementById("newArrayDiv").appendChild(newArrayText);
    }

    /*** Step 4
    ***********
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
            var rtIframeNameToggle = "rtIframe" + index;
            var rtToggleNameToggle = "rtToggleDiv" + index;
            //attach handles to DOM, making elements visible
            var tmHandle = document.getElementById(tmIframeNameToggle);
            var tmToggleHandle = document.getElementById(tmToggleNameToggle);
            var tcHandle = document.getElementById(tcIframeNameToggle);
            var tcToggleHandle = document.getElementById(tcToggleNameToggle);
            var aipdbHandle = document.getElementById(aipdbIframeNameToggle);
            var aipdbToggleHandle = document.getElementById(aipdbToggleNameToggle);
            var rtHandle = document.getElementById(rtIframeNameToggle);
            var rtToggleHandle = document.getElementById(rtToggleNameToggle);

            //create text area to display current URL for copying
            var clipboard = document.createElement("div");
            clipboard.id = "clipboard";
            clipboard.className = "clipboard";
            clipboard.style.cssText = 'overflow\:auto;z-index\:120000111;position\:fixed;top\:11px;left\:585px;height\:33px;padding-top\:4px;padding-left\:10px;padding-right\:18px;box-shadow\:5px 5px 2\.5px #555555;color\:white;background-color\:#0C4E6E;border-radius\:6px;border\:3px solid gray;font-family\:Arial;font-size\:12px;-webkit-font-smoothing\:antialiased;line-height\:27px';
            document.body.appendChild(clipboard);

            //if topbar is loaded already, tear it down and close things out
            if ( $(tmToggleHandle).css('display') === ('unset') ){
                $('.windows').each(function() {
                    $(this).css('display', 'none');
                });

                $('.toggleDiv').each(function() {
                    $(this).css('display', 'none');
                    $(this).css('z-index', '0')
                });
            } else {
                //if toolbar hasn't loaded yet, unhide the topnav for loading OSINT iframes and also pop out a virustotal window since you can't load VT in an iframe
                //hide all iframes and divs before loading the new batch, to avoid a user clicking one ip and then another without first toggling/closing the initial IP
                $('.windows, .toggleDiv').each(function() {
                    $(this).remove();
                });

                //set the clipboard text for copying
                var tm = "https\://www\.threatminer\.org/host\.php?q=" + myArray[index];
                clipboard.innerText = ""
                clipboard.innerText = "https\://www\.threatminer\.org/host\.php?q=" + myArray[index];

                //set threatminer iframe
                displayOsintIframe( this, 'https\://www\.threatminer\.org/host\.php?q=' + myArray[index] );

                //create class for instantiating toggle divs and onclick functionality
                class toggleDiv {
                    constructor(prefix,website,innertext) {
                        //set up the toggle div
                        var ToggleDiv = document.createElement('div');
                        //var ToggleDivName = prefix + "IframeName";
                        var ToggleDivName = prefix + "ToggleDiv";
                        var ToggleDivText = document.createElement('p');
                        ToggleDiv.id = ToggleDivName;
                        ToggleDiv.name = ToggleDivName;
                        ToggleDiv.value = ToggleDivName;
                        //Count number of existing divs and adjust width accordingly
                        var divNum = document.querySelectorAll('.toggleDiv').length;
                        var divLeft = 200 + (divNum * 125);
                        var divZIndex = (divNum + 120000111);
                        //Set the actual DIV properties
                        ToggleDiv.style.cssText = 'cursor\:pointer;display\:unset;position\:fixed;top\:6px;left\:' + divLeft + 'px;height\:39px;width\:100px;color\:white;;z-index\:' + divZIndex + ';background-color\:#0C4E6E;margin\:5;padding-left\:10px;padding-right\:10px;border\:2px solid gray;box-shadow\:5px 5px 2\.5px #555555;font-family\:Arial;font-size\:12px;-webkit-font-smoothing\:antialiased;line-height\:35px'
                        ToggleDiv.className = 'toggleDiv';
                        //set the text to append to this div
                        ToggleDiv.innerText += innertext;
                        //attach the DIV to the webpage
                        document.body.appendChild(ToggleDiv);
                        document.getElementById(ToggleDivName).appendChild(ToggleDivText);

                        $('#' + ToggleDivName).on("click", function() {
                            displayOsintIframe( this, website + myArray[index] );
                            //clear current clipboard contents before adding new info
                            clipboard.innerText = "";
                            //add URL to clipboard div for copying
                            clipboard.innerText += website + myArray[index];
                        });
                    }
                }

                //set threatminer toggle div class object
                tmdiv = new toggleDiv('tm','https://www.threatminer.org/host.php?q=','ThreatMiner');
                //set the default threatminer top nav text shadow
                $('#tmToggleDiv').css('text-shadow', '0 0 0.25em #f00, 0 0 0.25em #f00, 0 0 0.25em #f00');

                //set robtex toggle div class object
                rtdiv = new toggleDiv('rt','https://www.robtex.com/?dns=','robtex');

                //set threatminer toggle div class object
                tcdiv = new toggleDiv('tc','https://www.threatcrowd.org/ip.php?ip=','ThreatCrowd');
                setClipboardPosition();

                //unhide OSINT service toggle divs
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

var sidebarExists = document.getElementById("newArrayDiv");
if ( !sidebarExists ){
    chrome.runtime.sendMessage({
        action: "getSource",
        source: DOMtoString(document)
    });
}
