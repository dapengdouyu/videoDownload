function J(e, t) {
  var r = [];
  return (
    t.split("-").map(function (t) {
      r.push(e.getUint8(parseInt(t)));
    }),
    r
  );
}
function key_test(e) {
  var t,ee='97';
 
    function te(e,t){var r=[];return t.split("-").map((function(t){r.push(e.getUint8(parseInt(t)))})),r}
  
  if (20 === e.byteLength) {
    var r = (t = new DataView(e,0)).getUint8(0)
      , i = String.fromCharCode(r).toLowerCase()
      , a = parseInt(i, 36) % 2
      , n = t.getUint8(a)
      , s = String.fromCharCode(n)
      , o = t.getUint8(a + 1)
      , l = String.fromCharCode(o)
      , u = parseInt("" + s + l, 36) % 3;
    if (console.log(),
    2 === u) {
        var d = t.getUint8(5)
          , c = t.getUint8(6)
          , h = t.getUint8(9)
          , f = t.getUint8(10)
          , g = t.getUint8(13)
          , p = t.getUint8(14)
          , v = t.getUint8(17)
          , m = t.getUint8(18)
          , y = d - ee + 26 * (parseInt(String.fromCharCode(c), 10) + 1) - ee
          , b = h - ee + 26 * (parseInt(String.fromCharCode(f), 10) + 1) - ee
          , T = g - ee + 26 * (parseInt(String.fromCharCode(p), 10) + 1) - ee
          , E = v - ee + 26 * (parseInt(String.fromCharCode(m), 10) + 2) - ee;
        t = new DataView(new Uint8Array([t.getUint8(0), t.getUint8(1), t.getUint8(2), t.getUint8(3), t.getUint8(4), y, t.getUint8(7), t.getUint8(8), b, t.getUint8(11), t.getUint8(12), T, t.getUint8(15), t.getUint8(16), E, t.getUint8(19)]).buffer),
        console.log()
    } else if (1 === u) {
        var S = new Uint8Array(te(t, "0-1-2-8-9-10-11-12-18-17-16-15-14-4-5-6"));
        t = new DataView(S.buffer)
    } else {
        if (0 !== u)
            return;
        var _ = new Uint8Array(te(t, "0-1-2-3-4-15-16-17-18-10-11-12-13-6-7-8"));
        t = new DataView(_.buffer)
    }
} else if (17 === e.byteLength) {
    t = new DataView(e,1);
    var A = new Uint8Array(te(t, "8-9-2-3-4-5-6-7-0-1-10-11-12-13-14-15"));
    t = new DataView(A.buffer)
} else
    t = new DataView(e);
return t
}
function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}
export function input_key(t) {
  //var t = "2bd2a485y4976fe4w4t33"
  for (var r = new Uint8Array(t.length), i = 0; i < t.length; i++) {
    var str = t.charAt(i);
    r[i] = str.charCodeAt();
  }
  const result = String.fromCharCode.apply(
    null,
    new Uint8Array(key_test(toArrayBuffer(r)).buffer)
  );
  return result;
}
