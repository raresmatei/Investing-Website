function toggleMenu() {
    var flexBoxMenu = document.getElementById("main-menu");
    var flexBoxMenuItems = flexBoxMenu.getElementsByTagName("li");
    console.log(flexBoxMenuItems);
  
  
    for (var i = 1, len = flexBoxMenuItems.length; i < len; i++ ) {
      console.log(flexBoxMenuItems[i].style.display);
  
      if (flexBoxMenuItems[i].style.display =="block"){
        flexBoxMenuItems[i].style.display="none";
      }
      else{
        flexBoxMenuItems[i].style.display="block";
      }
      
    }
}

function printText(){
  console.log("agdas");
}