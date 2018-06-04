var arr = document.querySelectorAll('item')

for (var i = 0; i < arr.length; i++) {
    arr[i].click = function() {
        arr[i].addClass('test')
    }
}