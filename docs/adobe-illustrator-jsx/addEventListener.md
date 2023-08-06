var w = new Window("dialog");
var e1 = w.add("edittext", undefined, "1");
var e2 = w.add("edittext", undefined, "1");
e1.characters = e2.characters = 3;
e1.active = true;

function handle_key(key, control) {
    var step;
    key.shiftKey ? step = 10 : step = 1;
    switch (key.keyName) {
        case "Up":
            control.text = String(Number(control.text) + step);
            break;
        case "Down":
            control.text = String(Number(control.text) - step);
    }
} // handle_key
e1.addEventListener("keydown", function(k) {
    handle_key(k, this);
});
e2.addEventListener("keydown", function(k) {
    handle_key(k, this);
});
w.show();