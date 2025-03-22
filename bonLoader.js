chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.includes("history")){
        readLinks()
    }
    else {
        readArticles()
    }
});

function readLinks(){
    let receiptElements = document.getElementsByClassName("ticket-row_row__3-1Iv");
    let receiptList = [];

    for(let element of receiptElements){
        if (element.classList.contains("ticket-row_disabled__fT71C")) continue;
        receiptList.push("https://www.lidl.de" + element.attributes.href.nodeValue);
    }
    chrome.runtime.sendMessage({"link" : receiptList});
}

function readArticles() {
    let dataElements = document.getElementsByClassName("css_bold");
    let dataList = [];
    let articleList = [["Artikel", "Einzelpreis", "Menge", "Gesamtpreis"]];
    let article = "";
    let i = 0;
    let addElement = false;
    let temp = [];

    for(let element of dataElements){
        if (i == 2) {
            let tmp = temp[temp.length-1].split(" ");
            dataList.push(temp[temp.length-2] + ", " + tmp[0] + " " + tmp[2]);
        }
        if(element.className.includes("article") && article != element.attributes["data-art-description"].value){
            article = element.attributes["data-art-description"].value;
            if(element.attributes.hasOwnProperty("data-art-quantity")) {
                let sum = parseFloat(element.attributes["data-unit-price"].value.replace(",",".")) * parseFloat(element.attributes["data-art-quantity"].value.replace(",","."));
                sum = sum.toFixed(2).replace(",",".")
                articleList.push([element.attributes["data-art-description"].value, element.attributes["data-unit-price"].value, element.attributes["data-art-quantity"].value, sum.replace(".",",")]);
            }
            else {
                articleList.push([element.attributes["data-art-description"].value, element.attributes["data-unit-price"].value, "1", element.attributes["data-unit-price"].value]);
            }
        }
        else if( addElement || element.innerHTML.includes("gespart")) {
            dataList.push(element.innerHTML.split(" EUR")[0]);
            addElement = false;
        }
        else if(element.innerHTML == "zu zahlen"){
            addElement = true;
        }
        else if(i < 2 || element.id == "return_code_line_13" || element.id == "receipt_data_line_1"){
            temp.push(element.innerHTML);
        }
        i++;
    }

    dataList.push(temp[temp.length-2] + " " + temp[temp.length-1]);

    let csvArticleString = "";
    articleList.forEach(element => {
        csvArticleString += element.join(";") + "\n";
    });

    let csvDataString = dataList.join(";");

    console.log(csvArticleString);
    console.log(csvDataString);

    let date = dataList[dataList.length-1].replace(":","-");

    chrome.runtime.sendMessage({[date]: csvArticleString});
}
