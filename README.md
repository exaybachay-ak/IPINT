# IPINT
Chrome extension written in Javascript.  Completely stand-alone addition to Chrome that assist with investigations using a variety of Open-Source Intelligence sites.  

Current version can be used to assist in incident response and ongoing SOC investigation processes.  Future plans include the ability to read page data and color IP address based on detection by sites.

TO INSTALL:
<li>download and unzip files from github repo</li>
<li>open Chrome</li>
<li>browse to "chrome://extensions"</li>
<li>check box for "Developer mode"</li>
<li>click on "Load unpacked extension..."</li>
<li>browse to the unpacked repo directory and select "Open"</li>



Initial version includes:

<ul>
<li>ThreatMiner</li>
<li>ThreatCrowd</li>
<li>Robtex</li>
</ul>

Future releases may incorporate:

<ul>
<li>SenderBase</li>
<li>Cymru</li>
<li>GreenSnow.co</li>
<li>VirusTotal (API Calls and caching)</li>
</ul>

UPDATE 11-24-2023:
It seems like ThreatMiner is hit or miss, and sometimes when you load IPINT it won't go there.  When I loaded it today, I manually browsed to ThreatMiner, and then it started to work afterwards, so I think it could be something to do with cached data - if you cannot load ThreatMiner, try going there manually in your browser and then re-loading IPINT.
