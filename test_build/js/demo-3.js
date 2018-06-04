const _R = document.getElementById('r'),
    _O = _R.nextElementSibling.querySelector('output');

let v;

function update() {
    if (v !== +_R.value) {
        document.body.style.setProperty(`--r`, `${_O.value = v = +_R.value}px`)
    }
};

update();

_R.addEventListener('change', update, false);
_R.addEventListener('input', update, false);