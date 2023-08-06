```jsx
var win = new Window("dialog");
var btn = win.add("button", undefined, "Button", { name: "btn" });
function handle_key(key) {
    key.ctrlKey ? "" : alert("按了ctrl")
}
// handle_key
btn.addEventListener("keydown", function (k) {
    handle_key(k);
});
win.show();
```