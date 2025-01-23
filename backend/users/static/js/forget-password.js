let user_form = document.getElementById("user-form");
user_form.addEventListener('submit', (e) => check_user_email(e));

async function check_user_email(e) {
    e.preventDefault();

    let form = new FormData(user_form);
    const EMAIL = form.get("email");
    let token = await getToken(EMAIL);

  fetch("/api/get-basic-user/", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      Authorization: `Token ${token}`,
    },
  })
    .then((response) => {
      if (response.status == 200) {
        window.location.href = `/users/change-user-password/${data.user_data.email}/${data.user_data.id}/true`;
      }
    });
}