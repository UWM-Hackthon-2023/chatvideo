// import "./content.css"
chrome.script
initYoutube()
async function getLangOptionsWithLink(videoId) {
    const videoPageResponse = await fetch("https://www.youtube.com/watch?v=" + videoId);
    const videoPageHtml = await videoPageResponse.text();
    const splittedHtml = videoPageHtml.split('"captions":')

    if (splittedHtml.length < 2) { return; } // No Caption Available

    const captions_json = JSON.parse(splittedHtml[1].split(',"videoDetails')[0].replace('\n', ''));
    const captionTracks = captions_json.playerCaptionsTracklistRenderer.captionTracks;
    const languageOptions = Array.from(captionTracks).map(i => { return i.name.simpleText; })

    const first = "English"; // Sort by English first
    languageOptions.sort(function (x, y) { return x.includes(first) ? -1 : y.includes(first) ? 1 : 0; });
    languageOptions.sort(function (x, y) { return x == first ? -1 : y == first ? 1 : 0; });

    return Array.from(languageOptions).map((langName, index) => {
        const link = captionTracks.find(i => i.name.simpleText === langName).baseUrl;
        return {
            language: langName,
            link: link
        }
    })
}
async function getCaptionsCollection(videoId) {
    captionsResponse = await fetch(langOptionsWithLink[0].link)
    if (!captionsResponse.ok) {
        throw new Error(`HTTP error! status: ${captionsResponse.status}`)
    }
    parser = new DOMParser()
    captionsXML = await captionsResponse.text()
    captionsXML = parser.parseFromString(captionsXML, "text/xml")
    captionsCollections = captionsXML.getElementsByTagName("text")
    return Array.from(captionsCollections)
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


    waitForElement("ytd-watch-flexy").then((res) => {

        initYoutubeBlock(document.getElementById("secondary-inner"))
    })

    const videoId = getPara(window.location.href).v
    langOptionsWithLink = await getLangOptionsWithLink(videoId)
    if (!langOptionsWithLink) {
        return;
    }

    captions = await getCaptionsCollection(videoId)
    console.log(captions)

}

function initYoutubeBlock(secondary) {

    var youtubeBlock = document.createElement("div")
    youtubeBlock.id = "video-youtube-block-container"


    youtubeBlock.innerHTML = `
	<div class="block_wrap" style="">
            <p class="chapter_title">章节名称</p>
            <div style="display: flex; flex-direction: row; justify-content: space-between;">
                <button id="vyb-block-header-button-summary" >
                    Summary
                </button>
                <button id="block_wrap" class="title_item_wrap active" style="background: transparent;border: 0px;"/>
            </div>
    </div>
    
    <div id="list_wrap" class="node_wrap node_wrap_show">
            <p>123</p>
    </div>
    </div>
    `
    secondary.insertBefore(youtubeBlock, secondary.firstChild)
    // 获取标题元素
    var block_wrap = document.getElementById('block_wrap')
    console.log(block_wrap)
    //给标题元素添加点击事件，通过点击控制class的添加&去除达成动画效果
    block_wrap.onclick = function () {
        // 获取标题元素className集合
        let classArray = this.className.split(/\s+/)

        // 获取内容块元素
        let list_wrap = document.getElementById('list_wrap')

        // 判断标题元素是否有类active，如若存在，则说明列表展开，这时点击则是隐藏内容块，否则显示内容块
        if (classArray.includes('active')) {
            // 隐藏内容块
            block_wrap.classList.remove('active')
            list_wrap.classList.remove('node_wrap_show')
            list_wrap.classList.add('node_wrap_hide')
            console.log(this.className.split(/\s+/))
            return
        } else {
            // 显示内容块
            block_wrap.classList.add('active')
            list_wrap.classList.add('node_wrap_show')
            list_wrap.classList.remove('node_wrap_hide')
            return
        }
    }
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