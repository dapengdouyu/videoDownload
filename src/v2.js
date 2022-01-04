J = function (e, t) {
  var r = [];
  return (
    t.split("-").map(function (t) {
      r.push(e.getUint8(parseInt(t)));
    }),
    r
  );
};
function key_test(e) {
  var t;
  if (20 === e.byteLength) {
    var r = (t = new DataView(e, 0)).getUint8(0),
      i = String.fromCharCode(r).toLowerCase(),
      a = parseInt(i, 36) % 2,
      n = t.getUint8(a),
      s = String.fromCharCode(n),
      o = t.getUint8(a + 1),
      l = String.fromCharCode(o),
      u = parseInt("" + s + l, 36) % 3;
    if (2 === u) {
      var d = t.getUint8(3),
        c = t.getUint8(4),
        h = t.getUint8(8),
        f = t.getUint8(9),
        g = t.getUint8(14),
        p = t.getUint8(15),
        v = t.getUint8(18),
        m = t.getUint8(19),
        y = d - 97 + 26 * (parseInt(String.fromCharCode(c), 10) + 1) - 97,
        b = h - 97 + 26 * (parseInt(String.fromCharCode(f), 10) + 1) - 97,
        T = g - 97 + 26 * (parseInt(String.fromCharCode(p), 10) + 1) - 97,
        E = v - 97 + 26 * (parseInt(String.fromCharCode(m), 10) + 2) - 97;
      t = new DataView(
        new Uint8Array([
          t.getUint8(0),
          t.getUint8(1),
          t.getUint8(2),
          y,
          t.getUint8(5),
          t.getUint8(6),
          t.getUint8(7),
          b,
          t.getUint8(10),
          t.getUint8(11),
          t.getUint8(12),
          t.getUint8(13),
          T,
          t.getUint8(16),
          t.getUint8(17),
          E,
        ]).buffer
      );
    } else if (1 === u) {
      var S = new Uint8Array(J(t, "0-1-2-3-4-12-13-14-7-6-18-17-15-8-9-10"));
      t = new DataView(S.buffer);
    } else {
      if (0 !== u) return;
      var _ = new Uint8Array(J(t, "0-1-2-12-13-14-15-16-17-18-4-5-6-7-9-10"));
      t = new DataView(_.buffer);
    }
  } else if (17 === e.byteLength) {
    t = new DataView(e, 1);
    var A = new Uint8Array(J(t, "8-9-2-3-4-5-6-7-0-1-10-11-12-13-14-15"));
    t = new DataView(A.buffer);
  } else t = new DataView(e);
  return t;
}
function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}
module.exports = function input_key(t) {
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
};
