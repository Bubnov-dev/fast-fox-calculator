$(document).ready(function($){
$(".calculator__form input").removeAttr("disabled")
$("#progress-1").prop("checked", "checked")
// $(".calculator__step input").prop("checked", false)
$(".calculator__step input[type=\"text\"], .calculator__step textarea, .calculator__step select:not([name=\"panels\"]").val("")



const buttons = document.querySelectorAll('.calculator__info');
const tooltips = document.querySelectorAll('.calculator__info-tooltip');

for(let i=0; i<buttons.length; i++){
  let button = buttons[i];
  let tooltip = tooltips[i];
  let popperInstance = Popper.createPopper(button, tooltip, {
      modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      
  });

  function show() {
      tooltip.setAttribute('data-show', '');
    
      // We need to tell Popper to update the tooltip position
      // after we show the tooltip, otherwise it will be incorrect
      popperInstance.update();
    }
    
    function hide() {
      tooltip.removeAttribute('data-show');
    }
    
    let showEvents = ['mouseenter', 'focus'];
    let hideEvents = ['mouseleave', 'blur'];
    
    showEvents.forEach((event) => {
      button.addEventListener(event, show);
    });
    
    hideEvents.forEach((event) => {
      button.addEventListener(event, hide);
    });
}
let choicesPanels;
const selects = () => {
  const elements = $('.custom-select:not([name="panels" ])');
  elements.each(function(){

     let choices = new Choices($(this)[0], {
      searchEnabled: false,
      itemSelectText: "",
      placeholder: true,
      placeholderValue: "none",
    });
  
    $(".calculator__result-reset").on("click", function(){
      $(".calculator__form input").removeAttr("disabled")
      $(".calculator__form option").removeAttr("disabled")
      choices.setChoiceByValue("")
    });
    
  })

  
  choicesPanels = new Choices($('[name="panels"]')[0], {
    searchEnabled: false,
    itemSelectText: "",
    placeholder: true,
    placeholderValue: "none",
  });
 
  $(".calculator__result-reset").on("click", function(){
    $(".calculator__form input").removeAttr("disabled")
    $(".calculator__form option").removeAttr("disabled")
    choicesPanels.setChoiceByValue("")
  });
 
}

selects();

$("#new-btn").on("click", function(){
  window.location.reload()
})

inputs = $(".gerber-file")
inputs.each(function() {
  $(this).on('change', function(e){
  let input = $(this)

  input.parent().find(".wrong-file").addClass("hidden")
  if (input[0].files[0].size > 10000000){
    input.val('');
    input.parent().find(".wrong-file").removeClass("hidden")
    input.parent().find(".calculator__form-item-subtitle").html("<div class=\"wrong-file\">Неверный тип или размер файла</div>Только .zip максимум 10МБ");

  }
  else {

    var fileName = '';

    if( $(this)[0].files && $(this)[0].files.length > 1 ){
      fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
    }
    else{
      fileName = e.target.value.split( '\\' ).pop();
    }

    let ext  = fileName.split('.').pop();
    if (ext == "zip"){
      input.parent().find(".calculator__form-item-subtitle").html(fileName); 
    }
    else {
      input.val('');
      input.parent().find(".wrong-file").removeClass("hidden")
      input.parent().find(".calculator__form-item-subtitle").html("<div class=\"wrong-file\">Неверный тип или размер файла</div>Только .zip максимум 10МБ");
    }
  }
  
})
})


let cfs = new Map([
  [
    'materials', new Map([
      ['FR-4', 1],
      ["alu", 1.15]
    ])
  ],
  [
   'layers', new Map([
      ["1", 1] ,
      ["2", 1.2],
      ["4", 1.8],
      ["6", 2.5],
    ])
  ],
  [
    'designs', new Map([
      ["1", 1],
      ["2", 1.2],
      ["3", 1.8],
      ["4", 2.5]
    ])
  ],
  [
    "width-plate", new Map([
      ["0.4", 1],
      ["0.6", 1.2],
      ["0.8", 1.8],
      ["1.0", 2.5]
    ])
  ],
  [
  "finish", new Map([
    ["HASL", 1],
    ["LFHASL", 1.2],
    ["ENIG", 1.8]
   ])
  ],
  [
    "width-cu", new Map([
      ["35", 1],
      ["70", 1.2]
    ])
  ]
])

// [максимальное количество дм2, цена за дм2]
let prices = [
  [5, 10],
  [10, 9],
  [20, 8],
  [30, 7],
  [50, 6],
  [80, 5],
  [100, 3],
  [500, 1.8],
  [1000, 1.7],
  [2000, 1.6],
  [3000, 1.5],
  [5000,1.4]
]

let FR4Weight = new Map([
  ["0.4", 1],
  ["0.6", 1.35],
  ["0.8", 1.8],
  ["1.0", 2.2],
  ["1.2", 2.7],
  ["1.6", 3.5],
  ["2.0", 4.4]
])

let AluWeight = new Map([
  ["0.8", 2.5],
  ["1.0", 3.125],
  ["1.2", 3.75],
  ["1.6", 4.5],
  ["2.0", 5.6]
])

//отслеживание инпутов, реализация логики
jQuery.expr[':'].regex = function(elem, index, match) {
  var matchParams = match[3].split(','),
      validLabels = /^(data|css):/,
      attr = {
          method: matchParams[0].match(validLabels) ? 
                      matchParams[0].split(':')[0] : 'attr',
          property: matchParams.shift().replace(validLabels,'')
      },
      regexFlags = 'ig',
      regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g,''), regexFlags);
  return regex.test(jQuery(elem)[attr.method](attr.property));
}

let needDoubleReftesh = true
function refresh(){
  let tmpVal = choicesPanels.getValue().value

  choicesPanels.destroy()
  $('option').removeAttr("disabled")
  selects()

  choicesPanels.setChoiceByValue(tmpVal)

  $(".calculator__form input").removeAttr("disabled")
  $("*").removeClass("wrong")
  $(".checkForm").addClass("hidden")



  //Материал
  if($("[name=\"materials\"]:checked").val() == "alu"){

    $("[name=\"layers\"]:regex(value, 2|4|6)").attr("disabled", "disabled")
    $("[name=\"width-plate\"]:regex(value, 0.4|0.6|0.8|2.0)").attr("disabled", "disabled")
    $("[name=\"color-mask\"]:regex(value, purple|red|yellow|blue)").attr("disabled", "disabled")
    $("[name=\"finish\"]:regex(value, ENIG)").attr("disabled", "disabled")
    $("[name=\"width-cu\"]:regex(value, 70)").attr("disabled", "disabled")

    
  }

  //Количество слоев
  if($("[name=\"layers\"]:checked").val() == "1"){
    $("[name=\"width-plate\"]:regex(value, 0.4|0.6)").attr("disabled", "disabled")
    $("[name=\"color-mask\"]:regex(value, purple)").attr("disabled", "disabled")
    $("[name=\"width-cu\"]:regex(value, 70)").attr("disabled", "disabled")
  }
  if($("[name=\"layers\"]:checked").val() == "4"){
    $("[name=\"width-plate\"]:regex(value, 0.4|0.6)").attr("disabled", "disabled")
    $("[name=\"width-cu\"]:regex(value, 70)").attr("disabled", "disabled")
  }
  if($("[name=\"layers\"]:checked").val() == "6"){
    $("[name=\"width-plate\"]:regex(value, 0.4|0.6|0.8|1.0)").attr("disabled", "disabled")
    $("[name=\"color-mask\"]:regex(value, purple)").attr("disabled", "disabled")
  }

  //Панелизация
  if($("[name=\"panels\"]").val() == "service"){
      $("[name=\"designs\"]:regex(value, [2-9])").attr("disabled", "disabled")
      $("[name=\"width-plate\"]:regex(value, 0.4)").attr("disabled", "disabled")

  }

  if($("[name=\"designs\"]").val() > 1){
    choicesPanels.destroy()

    $('[name="panels"] [value="service"]').attr("disabled", "disabled")
    $('[name="panels"] [value="separate"]').attr("disabled", "disabled")

    choicesPanels = new Choices($('[name="panels"]')[0], {
      searchEnabled: false,
      itemSelectText: "",
      placeholder: true,
      placeholderValue: "none",
    });
  
    
    choicesPanels.setChoiceByValue("client")

  }

  if($.inArray($("[name=\"panels\"]").val(), ["client", "service"]) == -1){
    $("input:regex(name, numX|numY)").attr("disabled", "disabled");
    $("input:regex(name, numX|numY)").val("")
    $(".calculator__plats .calculator__form-item-title").html("Количество плат")
  }
  else{
      $(".calculator__plats .calculator__form-item-title").html("Количество панелей")
      if($("[name=\"designs\"]").val() > 1){
        $("input:regex(name, numX|numY)").attr("disabled", "disabled");
        $("input:regex(name, numX|numY)").val("")

      }

  }

  //толщина платы
  if($.inArray($("[name=\"width-plate\"]:checked").val(), ["0.4", "0.6", "0.8", "1.0", "1.2"] )!= -1){
    $("[name=\"width-cu\"]:regex(value, 70)").attr("disabled", "disabled")
  }
  if($.inArray($("[name=\"width-plate\"]:checked").val(), ["0.4", "0.6"] )!= -1){
    $("[name=\"layers\"]:regex(value, 1|4|6)").attr("disabled", "disabled")
    let tmpVal = choicesPanels.getValue().value
    choicesPanels.destroy()

    $('[name="panels"] [value="service"]').attr("disabled", "disabled")

    choicesPanels = new Choices($('[name="panels"]')[0], {
      searchEnabled: false,
      itemSelectText: "",
      placeholder: true,
      placeholderValue: "none",
    });

    if(tmpVal!="service"){
      choicesPanels.setChoiceByValue(tmpVal)
    }
  }
  else{
    let tmpVal = choicesPanels.getValue().value
    choicesPanels.destroy()


    choicesPanels = new Choices($('[name="panels"]')[0], {
      searchEnabled: false,
      itemSelectText: "",
      placeholder: true,
      placeholderValue: "none",
    });
    choicesPanels.setChoiceByValue(tmpVal)

  }
  if($.inArray($("[name=\"width-plate\"]:checked").val(), ["0.4"] )!= -1){
    $("[name=\"finish\"]:regex(value, LFHASL|ENIG)").attr("disabled", "disabled")
    $("[name=\"color-mask\"]:regex(value, red|yellow)").attr("disabled", "disabled")
  }

  //Цвет маски
  if($("[name=\"color-mask\"]:checked").val() == "purple"){
    $("[name=\"width-plate\"]:regex(value, 0.4|0.6)").attr("disabled", "disabled")
    $("[name=\"layers\"]:regex(value, 1|6)").attr("disabled", "disabled")
  }
  if($.inArray($("[name=\"color-mask\"]:checked").val(), ["red", "yellow"] )!= -1){
    $("[name=\"width-plate\"]:regex(value, 0.4)").attr("disabled", "disabled")
  }
  if($("[name=\"color-mask\"]:checked").val() == "black"){
    $("[name=\"width-cu\"]:regex(value, 70)").attr("disabled", "disabled")
  }

  //Цвет шелкографии
  if($("[name=\"color-mask\"]:checked").val() == "white"){
    $("#sh-color-black").prop('checked', true);
  }
  else{
    $("#sh-color-white").prop('checked', true);
  }

  $("[disabled]").prop('checked', false);


  
  result()
  
  //автовыбор еднственного оставшегося
  let attrs = new Set();
  $("input[type=\"radio\"]").each(function (){
    attrs.add($(this).attr("name"))
  })
  attrs.forEach( (value, valueAgain, attrs) => {
    let inputGroup = $("input[name=" + value + "]:not([disabled])");
    if(inputGroup.length==1){
      inputGroup.prop("checked", true)
    }
  })

  


  //повторение refresh()
  
  if(needDoubleReftesh){
    needDoubleReftesh = false
    refresh();
  }
  else {
    needDoubleReftesh = true
  }
}

function result(){
  
  //расчет коэффициента
  let cf = 1;
  $("input:checked").each(function(){
    let input = $(this)
    let cfsMap = cfs.get($(this).attr("name"));
    if (cfsMap){
      if (cfsMap.get(input.attr("value")))
         cf*= cfsMap.get(input.attr("value"));
    }
    else{
    }
    

  })

  //расчет площади 
  let S = 1;
  let plats = $("#numX").val() * $("#numY").val()
  if (plats == 0)
    plats =1
  
  S = $("#width").val() * $("#height").val() / 10000 * $("[name=\"panels-num\"]").val()*plats;

  
  

  $(".calculator__resul-S .calculator__result-value").html((S/100).toFixed(2))

  // Расчет веса
  let weight;
  

  if($("[name=\"materials\"]:checked").val() == "alu"){
    weight = AluWeight.get($("[name=\"width-plate\"]:checked").val()) * S/100
  }
  else{
    weight = FR4Weight.get($("[name=\"width-plate\"]:checked").val()) * S/100
  }
  if (isNaN(weight)){
    weight = 0
  }
  $(".calculator__result-weight .calculator__result-value").html(weight.toFixed(2))


  //расчет базовой цены

  let basePrice = [prices[0][1]];
  for( let i=0; i<prices.length; i++){
    if(prices[i][0]>S){
      basePrice = prices[i][1];
      i = prices.length;
    }
  }


  // Расчет итоговой цены
  let cfD = 1;

  $.getJSON("https://www.cbr-xml-daily.ru/daily_json.js", function(data) {
      cfD = data.Valute.USD.Value;
      let priceDollar = (basePrice * cf * S)
      let priceRub = (priceDollar*cfD)

      $(".calculator__result-price-dollar .calculator__result-value").html(priceDollar.toFixed(2))
      $(".calculator__result-price-rub .calculator__result-value").html(Math.ceil(priceRub));

  });
  

}

$("[name=\"designs\"]").on("change", function(){
  nonRecursion = true
})

$("#stencil").prop("checked", false)
refresh()

$(".calculator__step input, .calculator__step select, .calculator__step textarea").on("change", function(){
 refresh()
})

$(".calculator__step-1 input[type=\"text\"]").on("keyup", function(){
  let val = $(this).val();
  val = val.replace(/[^0-9]/g, '');
  if ($(this).is("#width")){
    if (val>400)
      val = 400
  }
  if ($(this).is("#height")){
    if (val>500)
      val = 500
  }

  $(this).val(val)

  result()
  // $(this)[0].value.replace('/[^1-9]/g', ' ');
})

$(".calculator__result-reset").on("click", function(){
  $("input").prop("checked", false)
  $(".calculator__form input").removeAttr("disabled")
  $(".calculator__form option").removeAttr("disabled")
  $("input, textarea, select").val("")

})


//открытие трафарета
$("#stencil").on("change", function(){
if ($(this).is(':checked')){
  $(".calculator__stencil").removeClass("hidden")
}
else{
  $(".calculator__stencil").addClass("hidden")
}
});


// маски

$("input.email").inputmask({
mask: "*{3,20}@*{3,20}.*{2,7}"
})
$("input.phone").inputmask({
mask: "+7 (999) 999-99-99"
})
$("input.plain-text-input").inputmask({
mask: "a{1,20}"
})


//steps

function steps(){
  $(".calculator__step").addClass("hidden")
  $(".calculator__step-"+$("[name=\"progress\"]:checked").val()).removeClass("hidden");

  if($("[name=\"progress\"]:checked").val()==2){
    $("#back-btn").removeClass("hidden")
  }
  else{
    $("#back-btn").addClass("hidden")

  }
  
  if($("[name=\"progress\"]:checked").val()==3){
    $("#new-btn").removeClass("hidden")
  }
  else{
    $("#new-btn").addClass("hidden")

  }

}
steps();
$("[name=\"progress\"]").on("change", function(){
steps()
})

$("#back-btn").on("click", function(){
$("#progress-1").prop("checked", true)
steps()
})

function checkOrder(){
  let mainAllInputs = new Set();
  let mainCheckedInputs = new Set();

  let calculatorAallInputs = new Set();
  let calculatorCheckedInputs = new Set();

  let canOrder = false
  $(".calculator__main input:not(#stencil), .calculator__main select").each(function(){
    if ($(this).is(":not([disabled])")){
      mainAllInputs.add($(this).attr('name'))
    }
  })
  $(".calculator__main input:not(#stencil)").each(function(){
    if ($(this).is("[type=\"radio\"]:checked") || ($(this).is("[type=\"text\"],[type=\"file\"]") && $(this).val()!="")){
      mainCheckedInputs.add($(this).attr('name'))
    }
  })
  $(".calculator__main select").each(function(){
    if ($(this).val()!=""){
      mainCheckedInputs.add($(this).attr('name'))
    }
  })


  if ($("#stencil").is(":checked")){
    $(".calculator__stencil input:not(#stencil), .calculator__stencil select").each(function(){
      if ($(this).is(":not([disabled])")){
        calculatorAallInputs.add($(this).attr('name'))
      }
    })
    $(".calculator__stencil input:not(#stencil)").each(function(){
      if ($(this).is("[type=\"radio\"]:checked") || ($(this).is("[type=\"text\"],[type=\"file\"]") && $(this).val()!="")){
        calculatorCheckedInputs.add($(this).attr('name'))
      }
    })
    $(".calculator__stencil select").each(function(){
      if ($(this).val()!=""){
        calculatorCheckedInputs.add($(this).attr('name'))
      }
    })
  }

  if (mainAllInputs.size <= mainCheckedInputs.size && calculatorAallInputs.size  <= calculatorCheckedInputs.size){
    canOrder = true
  }
  else{
    $("#checkForm1").removeClass("hidden")
    mainAllInputs.forEach((item) => {
      if (!mainCheckedInputs.has(item)) {
        if($("[name="+item+"]").is("select"))
          $("[name="+item+"]").parent(".choices__inner").addClass("wrong")
        else
          $("[name="+item+"]").addClass("wrong")
      }
    });

    calculatorAallInputs.forEach((item) => {
      if (!calculatorCheckedInputs.has(item)) {
        if($("[name="+item+"]").is("select"))
          $("[name="+item+"]").parent(".choices__inner").addClass("wrong")
        else
          $("[name="+item+"]").addClass("wrong")
      }
    });
  }
  console.log(mainAllInputs)
  console.log(mainCheckedInputs)
  return canOrder;
}
function checkOrder2(){
let mainAllInputs = new Set();
let mainCheckedInputs = new Set();

let canOrder = false
$(".calculator__step-2 input:not(#mail-check, #user-promo), .calculator__step-2 select, .calculator__step-2 textarea").each(function(){
  if ($(this).is(":not([disabled])")){
    mainAllInputs.add($(this).attr('name'))
  }
})
$(".calculator__step-2 input:not(#mail-check, #user-promo)").each(function(){
  if ($(this).is(":checked") || ($(this).is("[type=\"text\"],[type=\"file\"]") && $(this).val()!="" && $(this).inputmask("isComplete"))){
    mainCheckedInputs.add($(this).attr('name'))
  }
})
$(".calculator__step-2 select, .calculator__step-2 textarea").each(function(){
  if ($(this).val()!=""){
    mainCheckedInputs.add($(this).attr('name'))
  }
})


if (mainAllInputs.size == mainCheckedInputs.size ){
  canOrder = true
}
else{
  $("#checkForm2").removeClass("hidden")
  mainAllInputs.forEach((item) => {
    if (!mainCheckedInputs.has(item)) {
      if($("[name="+item+"]").is("select"))
        $("[name="+item+"]").parent(".choices__inner").addClass("wrong")
      else
        $("[name="+item+"]").addClass("wrong")
    }
  });

 
}


return canOrder;
}
$("#order-1, #progress-2 + label").on("click", function(){

  if(checkOrder() && !$("#progress-3").is(":checked")){
    $("#progress-2").removeAttr("disabled")
    $("#progress-2").prop("checked", true)
    
    steps()
  }
  else (
    $("#progress-2").attr("disabled", "disabled")

  )
})
$("#order-2").on("click", function(){
if(checkOrder2()){
  
  if($("#data-check").is(":checked")){


    var formData = new FormData();
    formData.append("gerber-file", $("#gerber-file").prop('files')[0], "gerber.zip")
    $.ajax({
        url: 'file.php',
        type: "POST",
        data: formData,
        async: false,
        success: function (msg) {
            readyJson(msg, 0);
        },
        error: function(msg) {
            alert('-Ошибка!');
        },
        cache: false,
        contentType: false,
        processData: false
    });
    if ($('#stencil').is(":checked")){
        var formData2 = new FormData();
        formData2.append("gerber-file", $("#gerber-file-2").prop('files')[0], "gerber-2.zip")
        $.ajax({
            url: 'file.php',
            type: "POST",
            data: formData2,
            async: false,
            success: function (msg) {
                readyJson(msg, 1);
  
            },
            error: function(msg) {
                alert('-Ошибка!');
            },
            cache: false,
            contentType: false,
            processData: false
        });
    }
    else readyJson("null", 1);
  
    
    

    $("#progress-3").prop("checked", true)
    steps()
    $("#progress-1").prop("disabled", "disabled")
    $("#progress-2").prop("disabled", "disabled")

  }

}
})
let ready = 0
let gerber1;
let gerber2;
function readyJson(url, num){


  if(num == 0)
    gerber1 = url
  else
    gerber2 = url

  if (ready==0){
    ready++
  }
  else if (ready == 1){
    getObject(gerber1, gerber2)
  }
}

function getObject(gerber1, gerber2){
  let checkedInputs = new Set();
  let obj = {}
  $(".calculator__main input:not(#stencil), .calculator__step-2 input").each(function(){
    if ($(this).is("[type=\"radio\"]:checked") || ($(this).is("[type=\"text\"]") && $(this).val()!="") && !$(this).is("[type=\"file\"]")){
      checkedInputs.add($(this).attr('name'))
      let str = $(this).attr('name')
      obj[str]= $(this).val()
    }
  })
  $(".calculator__main select, .calculator__main textarea").each(function(){
    if ($(this).val()!=""){
      checkedInputs.add($(this).attr('name'))
      let str = $(this).attr('name')
      obj[str]= $(this).val()
    }
  })

  if($("#stencil").is(":checked")){
    
    $(".calculator__stencil input").each(function(){
      if ($(this).is("[type=\"radio\"]:checked") || ($(this).is("[type=\"text\"]") && $(this).val()!="")&& !$(this).is("[type=\"file\"]")){
        checkedInputs.add($(this).attr('name'))
        let str = $(this).attr('name')
        obj[str]= $(this).val()
      }
    })
    $(".calculator__stencil select, .calculator__stencil textarea").each(function(){
      if ($(this).val()!=""){
        checkedInputs.add($(this).attr('name'))
        let str = $(this).attr('name')
        obj[str]= $(this).val()
      }
    })
  }


  obj["gerber-file-main"] = gerber1
  obj["gerber-file-stencil"] = gerber2
  obj["price"] = $(".calculator__result-price-rub .calculator__result-value").html()


  let json = JSON.stringify(obj);
  console.log(json)
  $.ajax({
    url: 'formproduct.php',
    type: "POST",
    data: {post_data:json},
    dataType: "json",
    async: false,
    success: function (msg) {
        alert(msg['value']);
    },
    error: function(msg) {
        alert('Ошибка!');
    }
  });
  return json
}

})

