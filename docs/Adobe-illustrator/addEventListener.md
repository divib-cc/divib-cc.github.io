```jsx
var w = new Window("dialog");
var e1 = w.add("edittext", [0, 0, 50, 20], 1);

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
}
// handle_key
e1.addEventListener("keydown", function (k) {
    handle_key(k, this);
});

w.show();
```