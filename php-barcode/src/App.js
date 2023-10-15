import { useRef, useState, useEffect } from "react";

function App() {

  const video = useRef(null);
  const canvas = useRef(null);
  const [barcode, setBarcode] = useState(null);
  const [basket, setBasket] = useState([]);

  const openCam = () => {
    navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
    .then(stream => {
      video.current.srcObject = stream;     
      video.current.play();       
      const ctx = canvas.current.getContext('2d');
      const barcode = new window.BarcodeDetector({
    formats: ["qr_code", "ean_13"]});

      setInterval(() => {
        canvas.current.width = video.current.videoWidth;
        canvas.current.height = video.current.videoHeight;
        ctx.drawImage(video.current, 0, 0, video.current.videoWidth, video.current.videoHeight);
        barcode.detect(canvas.current)
        .then(([data]) => {
          if(data) {
            setBarcode(data.rawValue);
          }
        })
        .catch(err => console.log(err))
      }, 100)

    })
    .catch(err => console.log(err))  
  }
  
useEffect(() => {
  if (barcode) {
    fetch('http://localhost/php-barcode/api.php?barcode=${barcode}')
    .then(res => res.json())
    .then(data => {
      if(data) {
        setBasket([...basket, data]);
      }
    })
  }
},[barcode])


  return (
    <>
    <button onClick={openCam}>Kamerayı Aç</button>
    <div>
      <video ref={video} autoPlay muted/>
      <canvas ref={canvas} />
    </div>
     {barcode && (
      <div>
        Bulunan barkod : {barcode}
      </div>
     )}
     {basket && basket.map(item => (
      <div>
        {item.product} <br/>
        {item.price} <br/>
        <img src={item.image} style={{width: 100, height:100}} />
      </div>
     )
     )}
    </>
  );
}

export default App;
