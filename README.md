## ATInternet plugin for Brightcove player

Important: only compatible with smarttag.js versions 5.5.0 and above.

This plugin is not compatible with Brightcove legacy Players.

If the player is implemented with the iframe or direct link methods, it will download a smarttag.js automatically.
If the player is implemented with the embed method (advanced), it will check if you already have a smarttag.js present (be sure to load it before the player if you have one), otherwise it will behave the same as the previous two methods.

Note that ads are not measured.

# Getting Started

* Download the plugin videojs.atinternet.version.min.js and place it on your server.
* Edit the player configuration in the Players Module of Video Cloud Studio.
* Under Plugins>JavaScript, add the URL to the plugin to the player configuration and click +.
* Under Plugins>Name, Options (JSON): 
    * Enter atinternet as the name
    * Add the following JSON with your tag data: site number, log and logSSL

```json
{
    "site": "xxxxxx",
    "log": "logxxx",
    "logSSL": "logxxx"
}
```

# Options

You can change a few things by adding options to the previous JSON

* mediaLevel2: If you want to define a level 2 for the player
* refreshDuration: If you want to change the refresh duration or disable it (5seconds minimum, 0 to disable)
* internalDomains: You can define a list of internal domains used to broadcast videos, others will be considered external
* isEmbedded: if you prefer, you can replace the option "internalDomains" by this one and directly define if a player will be used internally or externally (ex: {"isEmbedded": true} for external broadcasts)

```json
{
    "site": "xxxxxx",
    "log": "logxxx",
    "logSSL": "logxxx",
    "mediaLevel2": "x",
    "refreshDuration": "5",
    "internalDomains": ["subdomain1.mydomain.com","subdomain2.mydomain.com","myotherdomain.com"]
    //"isEmbedded": true
}
```

### License
MIT