window.modalPositions = [];
window.modals = [];

const setAttr = (arr, i, j, attr, val) => { for(i=i; i < j + 1; i++) arr[i].setAttribute(attr, val); }
const addClass = (arr, i, j, val) => { for(i=i; i < j + 1; i++) arr[i].classList.add(val); }
const removeClass = (arr, i, j, val) => { for(i=i; i < j + 1; i++) arr[i].classList.remove(val); }

const menuResize = () => {
    const width = window.innerWidth;
    let allElements = document.getElementsByClassName('drop-down-item');
    let start = allElements.length;
    const limits = [0, 480, 670, 860, 1200];
    // setAttr(allElements, 0, allElements.length - 1, 'show', 'true');
    removeClass(allElements, 0, allElements.length - 1, 'drop-down-show');
    for (let i = 0; i < limits.length; i++) {
        const limit = limits[i];
        if (width < limit) {
            // setAttr(allElements, i, allElements.length - 1, 'show', 'false');
            addClass(allElements, i, allElements.length - 1, 'drop-down-show');
            break;
        }
    }
}

window.addEventListener('resize', menuResize);

function toggleDropDown() {
    var ele = document.getElementById('drop-down-details');
    var show = ele.getAttribute('show') || 'false';
    console.log(show);
    ele.setAttribute('show', (show == 'true') ? 'false' : 'true');
}

const convertToArabicUnit = e => '<div style="float:left">' + e + '</div> &nbsp;1';
const _string = (en, ar) => ({ en, ar });
var strings = {
    km: _string('km', 'كم'),
    kmh: _string('km/hr', 'كم/ساعة'),
    s_1: _string('1s', 'الثانية'),
    second: _string('1 second', convertToArabicUnit('ثانية')),
    day: _string('1 day', convertToArabicUnit('يوم')),
    week: _string('1 week', convertToArabicUnit('أسبوع')),
    month: _string('1 month', convertToArabicUnit('شهر')),
    utc: _string('UTC', 'التوقيت العالمي'),
    dubai: _string('Dubai', 'دبي'),
    earth: _string('Earth', 'الأرض'),
    mars: _string('Mars', 'المريخ'),
    hope_probe: _string('Hope Probe', 'مسبار الأمل')
};

// MODAL CREATOR
window.addEventListener('load', () => {
    fetch(backendHost + '/track-hope-probe-modals').then(res => res.json())
        .then(res => {
            modals = [...res];
            modalPositions = modals.map(m => m.position);
        })
})

var converter = new showdown.Converter();
const modalContainer = $("#info-modal");
window.openModal = i => {
    const modalData = modals[i];

    modalContainer.find(".title").eq(0).html(window.lang == 'en' ? modalData.Title : modalData.arabic_title);
    modalContainer.find(".content").eq(0).html(converter.makeHtml(window.lang == 'en' ? modalData.content : modalData.arabic_content));
    modalContainer.css("display", "flex");
}

window.closeModal = () => {
    modalContainer.css("display", "none");
}