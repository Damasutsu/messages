const messagesList = document.querySelector('.messages-wrapper')

let i = 0

const myId = 1

const members = 3

function createMessage({
    text = '',
    attachments = [],
    messageId = ++i,
    timestamp = Date.now(),
    senderId = Math.floor(Math.random() * members) + 1,
    avatar = `https://picsum.photos/48/48?sig=${senderId}`
} = {}) {
    const isBottom = messagesList.parentNode.scrollHeight - messagesList.parentNode.scrollTop <= messagesList.parentNode.clientHeight + (messagesList.parentNode.clientHeight / 8)

    function createBubble(container) {
        const messageBubble = document.createElement('div')
        messageBubble.classList.add('message-bubble')
        messageBubble.setAttribute('data-message-id', messageId)
        container.append(messageBubble)

        const content = document.createElement('div')
        content.classList.add('message-content')
        messageBubble.append(content)

        const markerRead = document.createElement('div')
        markerRead.classList.add('bottom-marker')
        content.append(markerRead)

        const contentInner = document.createElement('div')
        contentInner.classList.add('content-inner')
        content.append(contentInner)

        const messageMeta = document.createElement('span')
        messageMeta.classList.add('meta')

        if (attachments.length != 0) {
            const mediaInner = document.createElement('div')
            mediaInner.classList.add('media-inner')
            for (let i = 0; i < attachments.length; i++) {
                const attachment = document.createElement('div')
                attachment.classList.add('attachment-item')
                const attachmentImg = document.createElement('img')
                const origWidth = Math.floor(Math.random() * 561) + 200
                const origHeight = Math.floor(Math.random() * 561) + 200
                attachmentImg.src = attachments[i].src || `https://picsum.photos/${origWidth}/${origHeight}`
                let width, height
                if (Math.min(origWidth, origHeight) === origHeight) {
                    width = clamp(origWidth, 200, 400)
                    height = clamp(width / origWidth * origHeight, 200, 400)
                } else {
                    height = clamp(origHeight, 200, 400)
                    width = clamp(height / origHeight * origWidth, 200, 400)
                }
                attachmentImg.width = width
                attachmentImg.height = height
                const spinner = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
                spinner.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
                spinner.setAttribute('viewBox', '0 0 100 100')
                spinner.classList.add('spinner')

                const spinnerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
                spinnerCircle.setAttribute('cx', '50')
                spinnerCircle.setAttribute('cy', '50')
                spinnerCircle.setAttribute('r', '40')
                spinnerCircle.setAttribute('stroke', '#999999')
                spinnerCircle.setAttribute('fill', 'none')
                spinnerCircle.setAttribute('stroke-width', '6')
                spinnerCircle.setAttribute('stroke-linecap', 'round')
                spinnerCircle.classList.add('spinner-circle')
                if (attachmentImg.complete) {
                    attachmentImg.classList.add('loaded')
                    spinner.remove()
                } else {
                    window.addEventListener('online', () => {
                        attachmentImg.src = attachmentImg.src
                    })
                    attachmentImg.onload = function() {
                        attachmentImg.style.visibility = ''
                        spinner.remove()
                        attachmentImg.classList.add('loaded')
                        attachmentImg.onload = () => {}
                    }
                    window.addEventListener('offline', () => {
                        if (attachmentImg.complete) return
                        attachmentImg.style.visibility = 'hidden'
                    })
                    attachmentImg.onerror = function() {
                        attachmentImg.style.visibility = 'hidden'
                        attachmentImg.onerror = () => {}
                    }
                }
                content.classList.add('media')
                spinner.append(spinnerCircle)
                attachment.append(attachmentImg)
                attachment.append(spinner)
                mediaInner.append(attachment)
            }
            contentInner.append(mediaInner)
        }

        if (text.length > 0) {
            const textContent = document.createElement('p')
            textContent.classList.add('text-content')
            textContent.textContent = text
            content.classList.add('text')
            contentInner.append(textContent)
            textContent.append(messageMeta)
        } else {
            contentInner.append(messageMeta)
        }

        const time = document.createElement('span')
        time.classList.add('message-time')
        time.textContent = new Date(timestamp).toLocaleTimeString().slice(0, -3)
        time.title = new Date(timestamp).toLocaleString(navigator.language, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        })

        messageMeta.append(time)
        return contentInner
    }

    if (Number(messagesList.lastChild?.dataset['senderId']) !== senderId) {
        const own = myId === senderId

        const wrapper = document.createElement('div')
        wrapper.classList.add('messages-container-wrapper')
        own && wrapper.classList.add('own')
        wrapper.setAttribute('data-sender-id', senderId)

        if (!own && members > 2) {
            const avatarElement = document.createElement('div')
            avatarElement.classList.add('avatar')

            const avatarImg = document.createElement('img')
            avatarImg.decoding = 'async'
            avatarImg.src = avatar

            avatarElement.append(avatarImg)
            wrapper.append(avatarElement)
        }

        const container = document.createElement('div')
        container.classList.add('messages-container')
        wrapper.append(container)

        contentInner = createBubble(container)

        if (!own && members > 2) {
            const title = document.createElement('div')
            title.classList.add('message-title')
            const titleSpan = document.createElement('span')
            titleSpan.textContent = `User with id: ${senderId}`
            title.append(titleSpan)
            contentInner.prepend(title)
        }

        messagesList.append(wrapper)
    } else {
        const wrapper = messagesList.lastChild
        const container = wrapper.querySelector('.messages-container')
        createBubble(container)
    }
    isBottom && (messagesList.parentNode.scrollTop = messagesList.parentNode.scrollHeight - messagesList.parentNode.clientHeight)
}

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max)
}

async function randomMessage() {
    const random = Math.floor(Math.random() * 7) + 1
    const text = random > 3 ? (await (await fetch('https://fish-text.ru/get?number=2')).json()).text : ''
    createMessage({
        own: random % 2 === 0,
        text,
        attachments: [...new Array(random)].map((attachment) => {
            return {
                src: ''
            }
        })
    })
}

window.addEventListener('offline', () => {
    connectionError.style.opacity = 1;
    connectionError.style.visibility = 'visible'
    clearInterval(interval)
})

window.addEventListener('online', () => {
    randomMessage()
    connectionError.style.opacity = '';
    connectionError.style.visibility = ''
    interval = setInterval(randomMessage, 2500)
})

const connectionError = document.querySelector('.connection-error')

let interval

if (navigator.onLine) {
    randomMessage()
    interval = setInterval(randomMessage, 2500)
} else {
    connectionError.style.opacity = 1;
    connectionError.style.visibility = 'visible'
}


let prevInnerWidth = innerWidth

function resize() {
    if (prevInnerWidth <= 992) {
        prevInnerWidth = innerWidth
        return
    }
    prevInnerWidth = innerWidth

    document.querySelector('main').classList.toggle('right-column-open', false)
}

window.addEventListener('resize', resize);

document.querySelector('main').addEventListener('touchstart', handleTouchStart, false);
document.querySelector('main').addEventListener('touchmove', handleTouchMove, false);
let xTouchDown = null;
let yTouchDown = null;

function getTouches(evt) {
    return evt.touches || // browser API
        evt.originalEvent.touches; // jQuery
}

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    xTouchDown = firstTouch.clientX;
    yTouchDown = firstTouch.clientY;
};

function handleTouchMove(evt) {
    if (innerWidth > 992 || !xTouchDown || !yTouchDown) {
        return;
    }
    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;
    let xDiff = xTouchDown - xUp;
    let yDiff = yTouchDown - yUp;
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > innerWidth / 8) {
            xTouchDown = null
            yTouchDown = null
            document.querySelector('main').classList.toggle('right-column-open', true)
        } else if (xDiff < -innerWidth / 8) {
            xTouchDown = null
            yTouchDown = null
            document.querySelector('main').classList.toggle('right-column-open', false)
        }
    } else {
        if (yDiff > 0) {
            xTouchDown = null
            yTouchDown = null
            console.log('down swipe')
        } else {
            xTouchDown = null
            yTouchDown = null
            console.log('up swipe')
        }
    }
};


document.querySelector('main').addEventListener('mousedown', handleMouseDown);
document.querySelector('main').addEventListener('mouseup', handleMouseUp);
document.querySelector('main').addEventListener('mousemove', handleMouseMove);
let mouseDown = null;
let xDown = null;
let yDown = null;

function handleMouseDown(evt) {
    mouseDown = true
    xDown = evt.clientX;
    yDown = evt.clientY;
};

function handleMouseUp() {
    mouseDown = false
    xDown = null;
    yDown = null;
};

function handleMouseMove(evt) {
    if (!mouseDown || !xDown || !yDown) {
        return;
    }
    let xUp = evt.clientX;
    let yUp = evt.clientY;
    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            xDown = null
            yDown = null
            mouseDown = false
            console.log('left mouse')
        } else {
            xDown = null
            yDown = null
            mouseDown = false
            console.log('right mouse')
        }
    } else {
        mouseDown = false
        console.log('vertical mouse')
    }
};

function _insertText(text) {
    if (document.queryCommandSupported('insertText')) {
        document.execCommand('insertText', false, text);
    } else {
        const range = document.getSelection().getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.selectNodeContents(textNode);
        range.collapse(false);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

document.querySelector('[contenteditable=true]')?.addEventListener('paste', (e) => {
    e.preventDefault()
    if (!e.clipboardData.types.includes('text/plain')) return
    _insertText(e.clipboardData.getData('text/plain'))
})

'ontouchstart' in document.documentElement && document.documentElement.classList.add('is-touch')
