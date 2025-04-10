# Self Attacks

## Josh  
**Date:** 4/10/25  
**Target Website:** `pizza.jamplan.click`  
**Attack Type:** Server Side Request Forgery  
**Severity:** High/2  

**Description of Result:**  
I could change the price of a pizza on the request so that all the pizzas are free.

**Image:**
![Test Image 1](images/image2.png)

**Corrections:**  
Get the price from the database on the server side rather than take it from the request.

---

## Gavin  
**Date:** 4/10/25  
**Target Website:** `localhost:3000`  
**Attack Type:** Injection  
**Severity:** High/2  

**Description of Result:**  
I could hijack the admin credentials and log in as the admin using my own credentials.

**Images:**  
![Test Image 1](images/image1.png)

**Corrections That Were Made:**  
I rewrote the whole thing in TypeScript, and when I did, I corrected this by not allowing unsanitized data (the email & ID) to be injected.

---

# Peer Attacks

## Josh Attacks Gavin  
**Date:** 4/10/25  
**Target Website:** `pizza.ghprime.click`  
**Attack Type:** Server Side Request Forgery  
**Severity:** High  

**Description:**  
I tried to change the price of a pizza on the request so that all the pizzas are free, but it didn’t work because he fixed it.

**Image:**  
![Test Image 1](images/image3.png)

**Correction:**  
He fixed it by getting the prices and descriptions from the database rather than the request.

---

## Gavin Attacks Josh  
**Date:** 4/10/25  
**Target Website:** `localhost:3000`  
**Attack Type:** Injection  
**Severity:** High/2  

**Description of Result:**  
I used a SQL injection attack to override the email and password of `userId 1` (which is the admin).  
Thus, I could hijack the admin credentials and log in as the admin using my own credentials.

**Images:**  
![Test Image 1](images/image1.png)

**Corrections That Were Made:**  
I rewrote the whole thing in TypeScript, and when I did, I corrected this. I fixed it by not allowing unsanitized data (the email & ID) to be injected.

---

# Combined Summary of Learning

- Sanitizing your database inputs is important.  
- Don’t rely on user input for anything but the necessary:  
  - ✅ Username → Yes  
  - ❌ Prices → No  
- Just because no one has hacked it yet doesn’t mean it’s secure.


# FYI

I also did this with Benjamin Brittain, but I did it second with him so thats why this primary one is with Josh