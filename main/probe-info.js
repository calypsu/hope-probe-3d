// document.getElementById('loader').style.display = 'none';
// console.log(backendHost);

const total_distance = 480492400.207269;

const addComas = num => {
    let further = 0;
    num = (num + "").split("").reverse();
    [...num].map((e, index) => {
        if ((index + 1) % 3 == 0 && index !== num.length - further - 1) {
            num.splice(index + (further++) + 1, 0, ",");
        }
    });
    num = num.reverse().join("");
    return num;
}

const data = {};

fetch(backendHost + '/probe-info')
    .then(response => response.json())
    .then(res => {
        res = res.map(item => {
            item.speed = Number(item.speed);
            item.distance_left = Number(item.distance_left);
            item.distance_travelled = Number(item.distance_travelled);
            return item;
        });

        const time_resolution = res[1].time - res[0].time;

        data.m_temp = 0;
        data.m_distance = (res[1].distance_travelled - res[0].distance_travelled) / time_resolution;
        data.m_speed = (res[1].speed - res[0].speed) / time_resolution;
        data.m_distance_left = (res[1].distance_left - res[0].distance_left) / time_resolution;

        data.c_temp = 7.33;
        data.c_distance = res[0].distance_travelled;
        data.c_distance_left = res[0].distance_left;
        data.c_speed = res[0].speed;

        data.t0 = res[0].time;
    });

const updateInfo = () => {
    const t = (new Date()).getTime() // + (4 * 60 * 60 * 1000);
    const d = data;
    const covered = Math.floor(d.c_distance + (d.m_distance * (t - d.t0)));
    const temperature = '7.33 C (45.19 F)';
    const speed = Math.floor(d.c_speed + (d.m_speed) * (t - d.t0));
    const remaining = Math.floor(d.c_distance_left + (d.m_distance_left * (t - d.t0)));
    const launch = Math.floor((t - (new Date('2020-07-19T21:58:00Z')).getTime()) / (1000 * 60 * 60 * 24));

    const convertValues = (val, unit) => (lang == 'ar') ? `<div style="float:left">${unit}</div> <span>${val}</span>` : val + ' ' + unit;

    setValues({
        launch,
        speed: convertValues(addComas(speed), strings.kmh[lang]),
        covered: convertValues(addComas(covered), strings.km[lang]),
        remaining: convertValues(addComas(remaining), strings.km[lang])
    });

    setTimeout(updateInfo, 500);
}

const setValues = values => {
    Object.keys(values).map(key => {
        const e = document.getElementById(key);
        if (e) e.innerHTML = values[key];
    });
}

updateInfo();