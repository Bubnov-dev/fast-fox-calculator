
$(document).ready(function () {
    
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
      })
     
    }

    selects();
    input = $("#gerber-file")
    input.on('change', function(e){
      console.log(input[0].files[0].size)
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
          ["Alu", 1.15]
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

    console.log(cfs);

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
      $("input").removeAttr("disabled")


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



      //расчет коэффициента
      $("[disabled]").prop('checked', false);
      let cf = 1;
      $("input:checked").each(function(){
        let input = $(this)
        let cfsMap = cfs.get($(this).attr("name"));
        console.log(input);
        console.log(input.attr("name"));
        if (cfsMap){
          console.log(cfsMap)
          console.log("value of " + input.attr("value") +" is " + cfsMap.get(input.attr("value")));
          if (cfsMap.get(input.attr("value")))
             cf*= cfsMap.get(input.attr("value"));
        }
        else{
          console.log("none")
        }
        
        //$(this).attr("name")])
      })

      //расчет площади 
      let S = 1;
      console.log("panels: " + $("[name=\"panels-num\"]").val())
      try{
        S = $("#width").val() * $("#height").val() / 10000 * $("[name=\"panels-num\"]").val();

      } 
      catch{
        S = 1
      }
      console.log("S = " + S)


      $(".calculator__result-price-rub .calculator__result-value").html(cf)

      
      if(needDoubleReftesh){
        needDoubleReftesh = false
        refresh();
      }
      else {
        needDoubleReftesh = true
      }
    }

  refresh()

   $("input, select").on("change", function(){
     refresh()
   })

   $("input[type=\"text\"]").on("keyup", function(){
    let val = $(this).val();
    console.log(val)
    val = val.replace(/[^1-9]/g, '');

    $(this).val(val)
    // $(this)[0].value.replace('/[^1-9]/g', ' ');
  })
})

