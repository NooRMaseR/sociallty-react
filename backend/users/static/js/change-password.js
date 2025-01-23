let user_form = document.getElementById("user-form");
const EMAIL = window.location.href.split("/")[5];

if (!EMAIL.match(/\w+.*@gmail\.com/g)) {
  document.getElementById("pass1-f").remove();
  document.getElementById("pass2-f").remove();
}
user_form.addEventListener("submit", (e) => check_user_email(e));

async function check_user_email(e) {
  e.preventDefault();

  let form = new FormData(user_form);
  const PASSWORD1 = form.get("password");
  const PASSWORD2 = form.get("password-confirm");
  let token = await getToken(EMAIL);
  let csrftoken = getCookie();

  if (token) {
    if (PASSWORD1 === PASSWORD2) {
      if (PASSWORD1.length >= 8 && PASSWORD2.length >= 8) {
        await fetch("/api/set-new-password/", {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
            "X-CSRFToken": csrftoken,
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ password: PASSWORD2 }),
        })
          .then((response) => {
            if (response.status == 200) {
              window.location.href = "/";
            } else open_banar("somthing went wrong, please try again", 200, 3000)
          });
      } else {
        let error = document.getElementById("error");
        error.textContent = "Password must Be at least 8 length";
        error.style.opacity = 1;
        error.style.color = "red";
      }
    } else {
      let error = document.getElementById("error");
      error.style.opacity = 1;
      error.style.color = "red";
    }
  }
}
