$(document).ready(function($){
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

    const selects = () => {
      const elements = document.querySelectorAll('.custom-select');
      elements.forEach(element=>{
         let choices = new Choices(element, {
          searchEnabled: false,
          itemSelectText: "",
          placeholder: true,
          placeholderValue: "none",
        });
        $(".calculator__result-reset").on("click", function(){
          console.log(choices)
          $(".calculator__form input").removeAttr("disabled")
          $(".calculator__form option").removeAttr("disabled")
          choices.setChoiceByValue("")
        });
        
      })
     
    }

    selects();
    input = $(".gerber-file")
    input.on('change', function(e){
      if (input[0].files[0].size > 10000000){
        input.val('');
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
          $("#gerber-subtitle").html(fileName); 
        }
        else {
          input.val('');

        }

        
      }
      
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
      console.log("none disabled!")
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
        $("[name=\"width-plate\"]:regex(value, 0.4|0.6|0.8)").attr("disabled", "disabled")
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
        ///todo дополнительные поля??
      }

      if($.inArray($("[name=\"panels\"]").val(), ["client", "service"]) == -1){
        $("input:regex(name, numX|numY)").attr("disabled", "disabled");
        $(".calculator__plats .calculator__form-item-title").html("Количество плат")
      }
      else{
        $(".calculator__plats .calculator__form-item-title").html("Количество панелей")
      }

      //толщина платы
      if($.inArray($("[name=\"width-plate\"]:checked").val(), ["0.4", "0.6", "0.8", "1.0", "1.2"] )!= -1){
        $("[name=\"width-cu\"]:regex(value, 70)").attr("disabled", "disabled")
      }
      if($.inArray($("[name=\"width-plate\"]:checked").val(), ["0.4", "0.6"] )!= -1){
        $("[name=\"layers\"]:regex(value, 1|4|6)").attr("disabled", "disabled")
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

      console.log("cf = " + cf);
      //расчет площади 
      let S = 1;
      let plats = $("#numX").val() * $("#numY").val()
      if (plats == 0)
        plats =1
      
      S = $("#width").val() * $("#height").val() / 10000 * $("[name=\"panels-num\"]").val()*plats;

      
      

      $(".calculator__resul-S .calculator__result-value").html((S/100).toFixed(2))

      // Расчет веса
      let weight;
      

      console.log("plats " + plats +" - " + $("#numX").val() + " - " + $("#numX").val())
      if($("[name=\"materials\"]:checked").val() == "alu"){
        weight = AluWeight.get($("[name=\"width-plate\"]:checked").val()) * S/100
      }
      else{
        weight = FR4Weight.get($("[name=\"width-plate\"]:checked").val()) * S/100
      }
      if (isNaN(weight)){
        console.log("weight is nan")
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
          console.log(cfD)
          let priceDollar = (basePrice * cf * S)
          let priceRub = (priceDollar*cfD)

          $(".calculator__result-price-dollar .calculator__result-value").html(Math.ceil(priceDollar))
          $(".calculator__result-price-rub .calculator__result-value").html(Math.ceil(priceRub));

      });
      

    }
  $("#stencil").prop("checked", false)
  refresh()

  $(".calculator__step input, .calculator__step select, .calculator__step textarea").on("change", function(){
     refresh()
  })

  $(".calculator__step-1 input[type=\"text\"]").on("keyup", function(){
    let val = $(this).val();
    val = val.replace(/[^0-9]/g, '');

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
      console.log(".calculator__step-"+$("[name=\"progress\"]:checked").val())
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
    $(".calculator__main input:not(#stencil), .calculator__main select, .calculator__main textarea").each(function(){
      if ($(this).is(":not([disabled])")){
        mainAllInputs.add($(this).attr('name'))
      }
    })
    $(".calculator__main input:not(#stencil)").each(function(){
      if ($(this).is("[type=\"radio\"]:checked") || ($(this).is("[type=\"text\"],[type=\"file\"]") && $(this).val()!="")){
        mainCheckedInputs.add($(this).attr('name'))
      }
    })
    $(".calculator__main select, .calculator__main textarea").each(function(){
      if ($(this).val()!=""){
        mainCheckedInputs.add($(this).attr('name'))
      }
    })


    if ($("#stencil").is(":checked")){
      $(".calculator__stencil input:not(#stencil), .calculator__stencil select, .calculator__stencil textarea").each(function(){
        if ($(this).is(":not([disabled])")){
          calculatorAallInputs.add($(this).attr('name'))
        }
      })
      $(".calculator__stencil input:not(#stencil)").each(function(){
        if ($(this).is("[type=\"radio\"]:checked") || ($(this).is("[type=\"text\"],[type=\"file\"]") && $(this).val()!="")){
          calculatorCheckedInputs.add($(this).attr('name'))
        }
      })
      $(".calculator__stencil select, .calculator__stencil textarea").each(function(){
        if ($(this).val()!=""){
          calculatorCheckedInputs.add($(this).attr('name'))
        }
      })
    }

    if (mainAllInputs.size == mainCheckedInputs.size && calculatorAallInputs.size == calculatorCheckedInputs.size){
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
    console.log(calculatorAallInputs)
    console.log(calculatorCheckedInputs)
    console.log(canOrder)
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
        $("#progress-3").prop("checked", true)
        steps()
        $("#progress-1").prop("disabled", "disabled")
        $("#progress-2").prop("disabled", "disabled")

      }
    }
  })

})

