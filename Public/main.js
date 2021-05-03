
valiDate = () =>{
    var fullName = document.getElementById('fullName').value;
    var cPassword = document.querySelector('.confirm').value;
    var password = document.querySelector('.pass').value;
    const tc = document.getElementById('tc').checked;

    if(cPassword != password){
    const div = document.createElement('div');
    div.className = 'row';
    div.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
    <strong>Password Error !</strong> Password Not Maching. Try Again
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
    </div>`;
    document.querySelector('.message').appendChild(div);
    return false;
    }
    if(fullName.length <= 5 ){
        const div = document.createElement('div');
        div.className = 'row';
        div.innerHTML = `<div class="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>Full Name !</strong> Please Enter Your Full Name Try Again .
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        </div>`;
        document.querySelector('.message').appendChild(div);  
        return false;
    }
    if(password.length <= 5 ){
        const div = document.createElement('div');
        div.className = 'row';
        div.innerHTML = `<div class="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>Password Error!</strong>Enter(5 char max)Password.Try Again.
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        </div>`;
        document.querySelector('.message').appendChild(div);  
        return false;
    } 
    if(tc == false){
      const div = document.createElement('div');
      div.className = 'row';
      div.innerHTML = `<div class="alert alert-warning alert-dismissible fade show" role="alert">
      <strong>Terms & Conditions !</strong>Please Check T&C to Continue.
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
      </div>`;
      document.querySelector('.message').appendChild(div);  
      return false;
    }
}








