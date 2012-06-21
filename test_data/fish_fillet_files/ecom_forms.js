/**
  * Support functions for rollover ad on bonappetit recipes and menus page
  * http://www.epicurious.com/recipesmenus/bonappetit/recipes
  * ecom placements
  *     link:     BNAsec_homePage_headline_subscribe
  *     rollover: BNAsec_homePage_headline_rollover
*/
function initEcomRecipeMenusForm() {
    var subscribe_link = document.getElementById('BNAsec_homePage_headline_subscribe');
    // Attach mouseover event to open the rollover
    subscribe_link.onmouseover = openEcomRecipeMenusForm;
    // Attach click event to open the rollover
    //subscribe_link.onclick = openEcomRecipeMenusForm;

    var close_link = document.getElementById('BNAsec_homePage_headline_rollover_header');
    // Attach click event to close the rollover
    close_link.onclick = closeEcomRecipeMenusForm;

    // set the autoclose timer and events
    setEvents('BNAsec_homePage_headline_rollover_wrapper');
}
function openEcomRecipeMenusForm() {
    openRollover('BNAsec_homePage_headline_rollover_wrapper');
}
function closeEcomRecipeMenusForm() {
    closeRollover('BNAsec_homePage_headline_rollover_wrapper');
}

/**
  * Support functions for rollover ad on recipe details view
  * http://www.epicurious.com/recipes/food/views/Almond-Banana-Smoothies-352553
  * ecom placements
  *     link:     BNA_recipeDetails_banner
  *     rollover: BNA_recipeDetails_form
*/

function initEcomRecipeDetailsForm() {
    var subscribe_link = document.getElementById('BNA_recipeDetails_banner');
    // Attach click event to open the rollover
    subscribe_link.onclick = openEcomRecipeDetailsForm;

    var close_link = document.getElementById('BNA_recipeDetails_form_header');
    // Attach click event to close the rollover
    close_link.onclick = closeEcomRecipeDetailsForm;

    // set the autoclose timer and events
    setEvents('BNA_recipeDetails_form_wrapper');
}
function openEcomRecipeDetailsForm() {
    openRollover('BNA_recipeDetails_form_wrapper');
   // return false;
}
function closeEcomRecipeDetailsForm() {
    closeRollover('BNA_recipeDetails_form_wrapper');
   // return false;
}

/**
  * Set events, open and close rollovers
*/
function setEvents(elementID) {
    var roll = document.getElementById(elementID);
    if (roll) {
        // Clear the auto-close timer if the user clicks the rollover
        roll.onclick = clearTimer;
        roll.onkeypress = clearTimer;
        roll.onkeydown = clearTimer;
        roll.onmousedown = clearTimer;

        // or clicks the form, if there is one
        var frm = roll.getElementsByTagName('form');
        if (frm) {
            frm.onclick = clearTimer;
            frm.onkeypress = clearTimer;
            frm.onkeydown = clearTimer;
            frm.onmousedown = clearTimer;

            //Close the rollover if the form is submitted
            theForm = document.forms['frm_regsub'];
            if (elementID == 'BNAsec_homePage_headline_rollover_wrapper') {
                theForm.onsubmit = closeEcomRecipeMenusForm;
                theForm.onreset = closeEcomRecipeMenusForm;
            } else {
                theForm.onsubmit = closeEcomRecipeDetailsForm;
                theForm.onreset = closeEcomRecipeDetailsForm;
            }
        }
    }
}
function openRollover(elementID) {
    var roll = document.getElementById(elementID);
    if (roll) {
        roll.style.display = "block";
    }
    // close the rollover in 10 seconds if it hasn't been clicked
    timer = setTimeout('closeRollover(\''+elementID+'\')', 10 * 1000);
    //return false;
}

function closeRollover(elementID) {
    var roll = document.getElementById(elementID);
    if (roll) {
        roll.style.display = "none";
    }
    // clear the auto-close timer
    clearTimeout(timer);
    return false;
}

function clearTimer() {
    // clear the auto-close timer
    clearTimeout(timer);
}