
initYoutube()
async function getLangOptionsWithLink(videoId) {
    const videoPageResponse = await fetch("https://www.youtube.com/watch?v=" + videoId);
    const videoPageHtml = await videoPageResponse.text();
    const splittedHtml = videoPageHtml.split('"captions":')
    
    if (splittedHtml.length < 2) { return; } // No Caption Available

    const captions_json = JSON.parse(splittedHtml[1].split(',"videoDetails')[0].replace('\n', ''));
    // console.log(captions_json)
    const captionTracks = captions_json.playerCaptionsTracklistRenderer.captionTracks;
    const languageOptions = Array.from(captionTracks).map(i => { return i.name.simpleText; })
    
    const first = "English"; // Sort by English first
    languageOptions.sort(function(x,y){ return x.includes(first) ? -1 : y.includes(first) ? 1 : 0; });
    languageOptions.sort(function(x,y){ return x == first ? -1 : y == first ? 1 : 0; });

    return Array.from(languageOptions).map((langName, index) => {
        const link = captionTracks.find(i => i.name.simpleText === langName).baseUrl;
        return {
        language: langName,
        link: link
        }
    })
}

function getPara(str) {
    let urlObj = new URL(str);
    let paramObj = {};
    urlObj.searchParams.forEach((val, key) => {
        paramObj[key] = val + ""
    })
    return paramObj
}
async function initYoutube() {
    const videoId = getPara(window.location.href).v
    console.log(await getLangOptionsWithLink(videoId))
    
    waitForElement("ytd-watch-flexy").then((res) => {

        initYoutubeBlock(document.getElementById("secondary-inner"))  
    })
}

function initYoutubeBlock(secondary) {
    
    var youtubeBlock  = document.createElement("div")
    youtubeBlock.id = "video-youtube-block-container"
    youtubeBlock.style = "width: auto; border: 1px solid #e0e0e0; padding: 10px; margin-bottom: 10px; border-radius: 5px;"
    youtubeBlock.innerHTML = `
        <div id="vyb-block-container-lfx" 
            style="display: flex; justify-content: space-between; flex-direction: column">
            <div id="vyb-block-header" style="display:flex; justify-content: space-between; flex-direction: row; border-radius: 5px;margin-bottom:5px">
                <button id="vyb-block-header-button-summary" >
                Summary
                </button>
            </div>

            <div id="vyb-block-content" style="display:flex;flex-direction: column; border: 1px solid #e0e0e0; height:200px; font-size:14px">
                "some transcript will be here"
            </div>
        </div>
    
    `
    secondary.insertBefore(youtubeBlock, secondary.firstChild)
}

function waitForElement(selector) {
    return new Promise(resolve => {
        // Check if the element already exists
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        // If the element doesn't exist, set up a MutationObserver to watch for changes
        const observer = new MutationObserver(mutations => {
            // Check if the element now exists
            if (document.querySelector(selector)) {
                // Resolve the promise with the element
                resolve(document.querySelector(selector));
                // Disconnect the observer to stop watching for changes
                observer.disconnect();
            }
        });

        // Start observing the body for changes (childList and subtree)
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}