

let count = 0
const bgList = ["home","office","nature","nature1"]
let bg = bgList[count]
const SpeechRecognition = (getbg)=>{
  // const handleSpeech = async (event) => {
  //   console.log("handle")
  //   const spokenText = event.results[event.results.length - 1][0].transcript.toLowerCase();
  //   const cleanedText = spokenText.replace('.', '').trim();
  //   console.log('Spoken Text:', cleanedText);
  //   console.log(cleanedText)
  //   if (cleanedText === "change"){
  //       count += 1
  //       if (count>bgList.length-1){
  //         count = 0
  //        bg = bgList[count]
  //       }else{
  //         bg=bgList[count]
  //       }
  //   }
  // };

    console.log("start")
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      console.log("handle")
      const spokenText = event.results[event.results.length - 1][0].transcript.toLowerCase();
      const cleanedText = spokenText.replace('.', '').trim();
      console.log('Spoken Text:', cleanedText);
      console.log(cleanedText)
      if (cleanedText === "change"){
          count += 1
          if (count>bgList.length-1){
            count = 0
           bg = bgList[count]
           getbg(bg)
          }else{
            bg=bgList[count]
            getbg(bg)
          }
      }
    };
    recognition.start();
    console.log("started at start")


        
        
        console.log(bg)
      return bg
}

export default SpeechRecognition
