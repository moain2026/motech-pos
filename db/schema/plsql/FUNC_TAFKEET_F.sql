-- FUNCTION: TAFKEET_F (status: INVALID)
CREATE OR REPLACE
FUNCTION Tafkeet_F(Amount   In	Number,
						  A_curr   In  Varchar2,
						  Lang_no  In  Number )
  Return Varchar2 Is
  Amnt_num    Number	     := Amount;
  Amnt_char   Varchar2 (50);
  Amnt1_char  Varchar2 (50);
  Frac_char   Varchar2 (50);
  V_Cur_Frc_No Number;
  Amnt	      Varchar2 (50);
  Amnt1       Varchar2 (50);
  Sub1	      Varchar2 (300) := Null;
  Sub2	      Varchar2 (300) := Null;
  Sub3	      Varchar2 (300) := Null;
  Sub4	      Varchar2 (300) := Null;
  Sub5	      Varchar2 (300) := Null;
  Plural      Varchar2 (1);
  Ln	      Number;
  Ln1	      Number;
  Ln2	      Number;
  Fc	      Number;
------------------------------------------------------------
  Frc_name    Varchar2 (50);
  Curr_name   Varchar2 (50);
  Miyat       Varchar2 (50)   := 'Cent';
  Miyatain    Varchar2 (50)   := 'Deux Cent';
  Alf	      Varchar2 (50)   := 'Mille';
  Alfain      Varchar2 (50)   := 'Deux Mille';
  Alaf	      Varchar2 (50)   := 'Mille';
  Million     Varchar2 (50)   := 'Million';
  Millionain  Varchar2 (50)   := 'Deux Millions';
  Malayeen    Varchar2 (50)   := 'Millions';
  Miliar      Varchar2 (50)   := 'Milliard';
  Miliarain   Varchar2 (50)   := 'Deux Milliards';
  Miliarat    Varchar2 (50)   := 'Milliards';
  Wa	      Varchar2 (50)   := 'et';
  Lng_No      Number:=Lang_no;

------------------------------------------------------------
  Function Is_zero (Amnt Varchar2, L Number)
    Return Boolean Is
------------------------------------------------------------
    Stat  Boolean := True;
    M	  Number  := 1;
  Begin
    While M <= L Loop
      If Substr (Amnt, M, 1) != 0 Then
	Stat := False;
	Exit;
      End If;

      M := M + 1;
    End Loop;

    Return (Stat);
  End;

------------------------------------------------------------
  Function Ones (Num Number)
    Return Varchar2 Is
------------------------------------------------------------
  Begin
    If Num = 0 Then
      Return (Null);
  elsif num = 1 then
    return('Un');
  elsif num = 2 then
    return('Deux');
  elsif num = 3 then
    return('Trois');
  elsif num = 4 then
    return('Quatre');
  elsif num = 5 then
    return('Cinq');
  elsif num = 6 then
    return('Six');
  elsif num = 7 then
    return('Sept');
  elsif num = 8 then
    return('Huit');
  elsif num = 9 then
    return('Neuf');
    End If;
  End;
------------------------------------------------------------
  Function Tens (Num Number)
    Return Varchar2 Is
------------------------------------------------------------
  Begin
    If Num = 0 Then
      Return (Null);
    elsif num = 11 then
   return('Onze');
  elsif num = 12 then
   return('Douze');
  elsif num = 13 then
   return('Treize');
  elsif num = 14 then
   return('Quatorze');
  elsif num = 15 then
   return('Quinze');
  elsif num = 16 then
   return('Seize');
  elsif num = 17 then
   return('Dix-Sept');
  elsif num = 18 then
   return('Dix-Huit');
  elsif num = 19 then
   return('Dix-Neuf');
  elsif num= 71 then
   return ('Soixante-Onze');
  elsif  num= 72 then
   return('Soixante-Douze');
  elsif num=73 then
   return('Soixante-Treize');
  elsif num=74 then
   return('Soixante-Quatorze');
  elsif num= 75 then
   return('Soixante-Quinze');
  elsif num=76 then
  return('Soixante-Seize');
   elsif num=77 then
  return('Soixante-Dix-Sept');
  elsif num=78 then
  return('Soixante-Dix-Huit');
  elsif num=79 then
  return('Soixante-Dix-Neuf');
  elsif num = 10 or num = 1 then
   return('Dix');
  elsif num = 20 then
   return('Vingt');
  elsif num = 30 then
   return('Trente');
  elsif num = 40 then
   return('Quarante');
  elsif num = 50 then
   return('Cinquante');
  elsif num = 60 then
   return('Soixante');
   elsif num = 70 then
   return('Soixante-Dix');
  elsif num = 80 then
   return('Quatre-Vingt');
  elsif num = 90 then
   return('Quatre-Vingt-Dix');
   elsif num= 91 then
   return ('Quatre-Vingt-Onze');
  elsif  num= 92 then
   return('Quatre-Vingt-Douze');
  elsif num=93 then
   return('Quatre-Vingt-Treize');
  elsif num=94 then
   return('Quatre-Vingt-Quatorze');
  elsif num= 95 then
   return('Quatre-Vingt-Quinze');
  elsif num=96 then
  return('Quatre-Vingt-Seize');
   elsif num=97 then
  return('Quatre-Vingt-Dix-Sept');
  elsif num=98 then
  return('Quatre-Vingt-Dix-Huit');
  elsif num=99 then
  return('Quatre-Vingt-Dix-Neuf');
    End If;
  End;

------------------------------------------------------------
  Function Hundred (Num Number)
    Return Varchar2 Is
------------------------------------------------------------
  Begin
 if num = 100 then
  return('Cent');
 elsif num = 200 then
  return('Deux Cent');
 elsif num = 300 then
  return('Trios Cent');
 elsif num = 400 then
  return('Quatre Cent');
 elsif num = 500 then
  return('Cinq Cent');
 elsif num = 600 then
  return('Six Cent');
 elsif num = 700 then
  return('Sept Cent');
 elsif num = 800 then
  return('Huit Cent');
 elsif num = 900 then
  return('Neuf Cent');
    End If;
  End;

------------------------------------------------------------
  Function One_digit (Amnt Varchar2)
    Return Varchar2 Is
------------------------------------------------------------
  Begin
    If Amnt = 0 Then
      Return (Null);
    Elsif Amnt = 1 Then
      Return (Curr_name);
    Elsif Amnt = 2 Then
      Return ('Deux' || ' ' || Curr_name);
    Elsif Amnt Between '3' And '10' Then
      Return (Curr_name);
    Else    	
      Return (Ones (To_number (Amnt)) || ' ' || Curr_name);
    End If;
  End;
  Function Two_digits (Amnt Varchar2)
    Return Varchar2 Is
    Sub1	  Varchar2 (30) := Null;
    Sub2	  Varchar2 (30) := Null;
    First_digit   Varchar2 (1);
    Second_digit  Varchar2 (1);
  Begin
    First_digit := Substr (Amnt, 1, 1);
    Second_digit := Substr (Amnt, 2, 1);

    If First_digit = 0 Then
      Sub1 := One_digit (Second_digit);
    End If;

    If First_digit = 1 Or First_digit = 7 Or First_digit = 9 Or Second_digit = 0 Then
      Sub1 := Tens (To_number (Amnt));
    Else
      Sub1 := Ones (To_number (Second_digit));
      Sub2 := Tens (To_number (First_digit) * 10);
    End If;

    If Sub2 Is Not Null And  Lng_No = 1  Then
      Sub1 := Sub1 || ' ' || Wa;
    End If;

    If Second_digit = 1 And First_digit <> 1 And First_digit <> 0 And First_digit <> 7 And First_digit <> 9 Then
	   Return (Sub2 || ' ' || Wa || ' ' || Sub1);
    Else
    If First_digit = 0 Or First_digit = 1 Or First_digit = 7 Or First_digit = 9 Or Second_digit = 0 Then
	Return (Sub2 || ' ' || Sub1);
	Else
    Return (Sub2 || '-' || Sub1);
    End If;
    End If;
  End;

  Function One_digit_h (Amnt Varchar2)
    Return Varchar2 Is
  Begin
    If Amnt = 0 Then
      Return (Null);
    Elsif Amnt = 2 Then
      Return (Frc_name);
    Elsif Amnt Between 3 And 10 Then
      Return (Frc_name);
    Else
      Return (Ones (To_number (Amnt)) || ' ' || Frc_name);
    End If;
  End;
  Function Two_digits_h (Amnt Varchar2)
    Return Varchar2 Is
    Sub1	  Varchar2 (30) := Null;
    Sub2	  Varchar2 (30) := Null;
    First_digit   Varchar2 (1);
    Second_digit  Varchar2 (1);
  Begin
    First_digit := Substr (Amnt, 1, 1);
    Second_digit := Substr (Amnt, 2, 1);

    If First_digit <> 1 And Second_digit <> 0 Then
     if  First_digit=1 or  First_digit=7 or First_digit=9 then
     Sub1 := Tens( to_number(amnt));
     Sub2 := null;
     return(Wa || ' ' || sub1|| ' ' || frc_name);
      end if;
      Sub1 := Ones (To_number (Second_digit));
      Sub2 := Tens (To_number (First_digit) * 10);

      If Second_digit = 1 And First_digit <> 1 And First_digit <> 0 And First_digit <> 7 And First_digit <> 9 Then
	     Return (Sub2 || ' ' || Wa || ' ' || Sub1 || ' ' || Frc_name);
      Else
       If First_digit = 0 Or First_digit = 1 Or First_digit = 7 Or First_digit = 9 Or Second_digit = 0 Then
	Return (Wa || ' ' || Sub2 || ' ' || Sub1 || ' ' || Frc_name);
       Else
	Return (Wa || ' ' || Sub2 || '-' || Sub1 || ' ' || Frc_name);
     End If;
      End If;
    End If;

    If First_digit = 0 Then
      Return (One_digit_h (Second_digit));
    End If;

    If First_digit = 1 Or Second_digit = 0 Then
      Sub1 := Tens (To_number (Amnt));
      Sub2 := Null;
      Return (Wa || ' ' || Sub1 || ' ' || Frc_name);
    End If;

    If First_digit > 1 Or Second_digit = 0 Then
      Sub1 := Tens (To_number (Amnt) * 10);
      Sub2 := Null;
      Return (Wa || ' ' || Sub1 || ' ' || Frc_name);
    End If;
  End;
------------------------------------------------------------
Function Three_Digits_H (Amnt Varchar2) Return Varchar2 Is
 ------------------------------------------------------------
      Sub1 Varchar2(500) := Null;
      Sub2 Varchar2(500) := Null;
      First_Digit Varchar2(1);
      Second_Digit Varchar2(1);
 Begin
	 First_Digit := Substr(Amnt,1,1);
	 If First_Digit = 0 Then
	  Return(Two_Digits_H(Substr(Amnt,2,2)));
	 End If;
	 Sub1 := Hundred(To_Number(First_Digit)*100);
	 If Is_Zero( Substr(Amnt,2,2), 2) Then
	  Sub2 := ' ' || Frc_Name;
	 Else
	  Sub1 := Sub1 ;
	  Sub2 := Two_Digits_H( Substr(Amnt,2,2));
	 End If;
	 Return(Wa || ' ' || Sub1||' '||Sub2);
 End;
------------------------------------------------------------
  Function Three_digits (Amnt Varchar2)
    Return Varchar2 Is
    Sub1	  Varchar2 (500) := Null;
    Sub2	  Varchar2 (500) := Null;
    First_digit   Varchar2 (1);
    Second_digit  Varchar2 (1);
  Begin
    First_digit := Substr (Amnt, 1, 1);

    If First_digit = 0 Then
      Return (Two_digits (Substr (Amnt, 2, 2)));
    End If;

    Sub1 := Hundred (To_number (First_digit) * 100);

    If Is_zero (Substr (Amnt, 2, 2), 2) Then
      Sub2 := Null;
    Else
      Sub1 := Sub1 ;
      Sub2 := Two_digits (Substr (Amnt, 2, 2));
    End If;

    Return (Sub1 || ' ' || Sub2);
  End;

  Function Four_digits (Amnt Varchar2)
    Return Varchar2 Is
    Sub1  Varchar2 (200) := Null;
    Sub2  Varchar2 (200) := Null;
  Begin
    If Substr (Amnt, 1, 1) = 0 Then
      Return (Three_digits (Substr (Amnt, 2, 3)));
    End If;

    If Substr (Amnt, 1, 1) = 1 Then
      Sub1 := Alf;
      Sub2 := Null;
    Elsif Substr (Amnt, 1, 1) = 2 Then
      Sub1 := Alfain;
      Sub2 := Null;
    Else
      Sub1 := Ones (To_number (Substr (Amnt, 1, 1))) || ' ' || Alaf;
      Sub2 := Null;
    End If;

    If To_number (Substr (Amnt, 2, 3)) > 0 Then
      Sub2 := Three_digits (Substr (Amnt, 2, 3));
    End If;

    If Sub2 Is Not Null Then
      Sub1 := Sub1 || ' ' || Sub2;
    End If;

    Return (Sub1);
  End;
------------------------------------------------------------
  Function Five_digits (Amnt Varchar2)
    Return Varchar2 Is
    Sub1  Varchar2 (200) := Null;
    Sub2  Varchar2 (200) := Null;
  Begin
    If Substr (Amnt, 1, 1) = 0 Then
      Return (Four_digits (Substr (Amnt, 2, 4)));
    End If;

    Sub1 := Two_digits (Substr (Amnt, 1, 2));

    If Substr (Amnt, 1, 2) = 1 Then
      Sub1 := Sub1 || ' ' || Alaf;
    Else
      Sub1 := Sub1 || ' ' || Alf;
    End If;

    If To_number (Substr (Amnt, 3, 3)) > 0 Then
      Sub2 := Three_digits (Substr (Amnt, 3, 3));
    End If;

    If Sub2 Is Not Null Then
      Sub1 := Sub1 || ' ' || Sub2;
    End If;

    Return (Sub1);
  End;
------------------------------------------------------------
  Function Six_digits (Amnt Varchar2)
    Return Varchar2 Is
    Sub1  Varchar2 (200) := Null;
    Sub2  Varchar2 (200) := Null;
  Begin
    If Substr (Amnt, 1, 1) = 0 Then
      Return (Five_digits (Substr (Amnt, 2, 5)));
    End If;

    Sub1 := Three_digits (Substr (Amnt, 1, 3)) || ' ' || Alf;

    If To_number (Substr (Amnt, 4, 3)) > 0 Then
      Sub2 := Three_digits (Substr (Amnt, 4, 3));
    End If;

    If Sub2 Is Not Null Then
      Sub1 := Sub1 || ' ' || Sub2;
    End If;

    Return (Sub1);
  End;
------------------------------------------------------------
  Function Seven_digits (Amnt Varchar2)
    Return Varchar2 Is
------------------------------------------------------------
    Sub1  Varchar2 (200) := Null;
    Sub2  Varchar2 (200) := Null;
  Begin
    If Substr (Amnt, 1, 1) = 0 Then
      Return (Six_digits (Substr (Amnt, 2, 6)));
    End If;

    If Substr (Amnt, 1, 1) = 1 Then
      Sub1 := Ones (Substr (Amnt, 1, 1)) || ' ' || million;
    Elsif Substr (Amnt, 1, 1) = 2 Then
      Sub1 := Millionain;
    Else
      Sub1 := Ones (Substr (Amnt, 1, 1)) || ' ' || Malayeen;
    End If;

    If To_number (Substr (Amnt, 2, 6)) > 0 Then
      Sub2 := Six_digits (Substr (Amnt, 2, 6));
    End If;

    If Sub2 Is Not Null Then
      Sub1 := Sub1 || ' ' || Sub2;
    End If;

    Return (Sub1);
  End;
------------------------------------------------------------
  Function Eight_digits (Amnt Varchar2)
    Return Varchar2 Is
------------------------------------------------------------
    Sub1  Varchar2 (200) := Null;
    Sub2  Varchar2 (200) := Null;
  Begin
    If Substr (Amnt, 1, 1) = 0 Then
      Return (Seven_digits (Substr (Amnt, 2, 7)));
    End If;

    Sub1 := Two_digits (Substr (Amnt, 1, 2));

    If Substr (Amnt, 1, 2) = '10' Then
      Sub1 := Sub1 || ' ' || Malayeen;
    Else
      Sub1 := Sub1 || ' ' || Malayeen;
    End If;

    If To_number (Substr (Amnt, 2, 7)) > 0 Then
      Sub2 := Six_digits (Substr (Amnt, 3, 6));
    End If;

    If Ltrim (Rtrim ((Sub2))) Is Not Null Then
      Sub1 := Sub1 || ' ' || Sub2;
    End If;

    Return (Sub1);
  End;
------------------------------------------------------------
  Function Nine_digits (Amnt Varchar2)
    Return Varchar2 Is
------------------------------------------------------------
    Sub1  Varchar2 (200) := Null;
    Sub2  Varchar2 (200) := Null;
  Begin
    If Substr (Amnt, 1, 1) = 0 Then
      Return (Eight_digits (Substr (Amnt, 2, 8)));
    End If;

    Sub1 := Hundred (To_number (Substr (Amnt, 1, 1)) * 100);

    If Substr (Amnt, 2, 1) = 0 Then
      If Substr (Amnt, 3, 1) = 1 Then
	Sub1 := Sub1 || ' ' || Ones (1) || ' ' || Malayeen;
      Elsif Substr (Amnt, 3, 1) = 2 Then
	Sub1 := Sub1 || ' ' || Millionain;
      Elsif Substr (Amnt, 2, 2) = '00' Then
	Sub1 := Sub1 || ' ' || Malayeen;
      Else
	Sub1 :=
	     Sub1
	  || ' '
	  || Ones (To_number (Substr (Amnt, 3, 1)))
	  || ' '
	  || Malayeen;
      End If;
    Elsif Substr (Amnt, 2, 2) = '10' Then
      Sub1 :=
	   Sub1
	|| ' '
	|| Tens (To_number (Substr (Amnt, 2, 2)))
	|| ' '
	|| Malayeen;
    Else
      Sub1 :=
	   Sub1
	|| ' '
	|| Two_digits (Substr (Amnt, 2, 2))
	|| ' '
	|| Malayeen;
    End If;

    If To_number (Substr (Amnt, 4, 6)) > 0 Then
      Sub2 := Six_digits (Substr (Amnt, 4, 6));
    End If;

    If Sub2 Is Not Null Then
      Sub1 := Sub1 || ' ' || Sub2;
    End If;

    Return (Sub1);
  End;
------------------------------------------------------------
  Function Ten_digits (Amnt Varchar2)
    Return Varchar2 Is
------------------------------	  ! l	------------------------------
    Sub1  Varchar2 (200) := Null;
    Sub2  Varchar2 (200) := Null;
  Begin
    If Substr (Amnt, 1, 1) = 0 Then
      Return (Nine_digits (Substr (Amnt, 2, 9)));
    End If;

    If Substr (Amnt, 1, 1) = 1 Then
      Sub1  := Ones (Substr (Amnt, 1, 1)) || ' ' || Miliar;
    Elsif Substr (Amnt, 1, 1) = 2 Then
      Sub1 := Miliarain;
    Else
      Sub1 := Ones (Substr (Amnt, 1, 1)) || ' ' || Miliarat;
    End If;

    If To_number (Substr (Amnt, 2, 9)) > 0 Then
      Sub2 := Nine_digits (Substr (Amnt, 2, 9));
    End If;

    If Sub2 Is Not Null Then
      Sub1 := Sub1 || ' ' || Sub2;
    End If;

    Return (Sub1);
  End;
------------------------------------------------------------
  Function Eleven_digits (Amnt Varchar2)
    Return Varchar2 Is
------------------------------------------------------------
    Sub1  Varchar2 (200) := Null;
    Sub2  Varchar2 (200) := Null;
  Begin
    If Substr (Amnt, 1, 1) = 0 Then
      Return (Ten_digits (Substr (Amnt, 2, 10)));
    End If;

    Sub1 := Two_digits (Substr (Amnt, 1, 2));

    If Substr (Amnt, 1, 2) = '10' Then
      Sub1 := Sub1 || ' ' || Miliarat;
    Else
      Sub1 := Sub1 || ' ' || Miliarat;
    End If;

    If Substr (Amnt, 3, 9) > 0 Then
      Sub2 := Nine_digits (Substr (Amnt, 3, 9));
    End If;

    If Sub2 Is Not Null Then
      Sub1 := Sub1 || ' ' || Sub2;
    End If;

    Return (Sub1);
  End;
------------------------------------------------------------
  Function Twelve_digits (Amnt Varchar2)
    Return Varchar2 Is
------------------------------------------------------------
    Sub1  Varchar2 (200) := Null;
    Sub2  Varchar2 (200) := Null;
  Begin
    If Substr (Amnt, 1, 1) = 0 Then
      Return (Eleven_digits (Substr (Amnt, 2, 11)));
    End If;

    Sub1 := Hundred (To_number (Substr (Amnt, 1, 1)) * 100);

    If Substr (Amnt, 2, 1) = 0 Then
      If Substr (Amnt, 3, 1) = 1 Then
	Sub1 := Sub1 || ' ' || Ones (1) || ' ' || Miliar;
      Elsif Substr (Amnt, 3, 1) = 2 Then
	Sub1 := Sub1 || ' ' || Miliarain;
      Elsif Substr (Amnt, 2, 2) = '00' Then
	Sub1 := Sub1 || ' ' || Miliarat;
      Else
	Sub1 :=
	     Sub1
	  || ' '
	  || Ones (To_number (Substr (Amnt, 3, 1)))
	  || ' '
	  || Miliarat;
      End If;
    Elsif Substr (Amnt, 2, 2) = '10' Then
      Sub1 :=
	   Sub1
	|| ' '
	|| Tens (To_number (Substr (Amnt, 2, 2)))
	|| ' '
	|| Miliarat;
    Else
      Sub1 :=
	   Sub1
	|| ' '
	|| Two_digits (Substr (Amnt, 2, 2))
	|| ' '
	|| Miliarat;
    End If;

    If To_number (Substr (Amnt, 4, 9)) > 0 Then
      Sub2 := Nine_digits (Substr (Amnt, 4, 9));
    End If;

    If Sub2 Is Not Null Then
      Sub1 := Sub1 || ' ' || Sub2;
    End If;

    Return (Sub1);
  End;
------------------------------------------------------------
  Procedure Check_riyals (Amnt Varchar2) Is
------------------------------------------------------------
  Begin
    If Amnt = '10' Then
      Sub1 := Sub1 || ' ' || Curr_name;
    Elsif Amnt Between '01' And '09' Then
      Sub1 := Sub1 || ' ' || Curr_name;
    -- null;
    Elsif Ln = 1 Then
      Null;
    Else
      Sub1 := Sub1 || ' ' || Curr_name;
    End If;

    If Ln1 > 0 Then
      Sub1 := Sub1 || ' ' || Sub5;
    End If;
  End;
Begin
  -- main function starts --
--================================================
    Begin
	Select	  Decode(Lang_No,1,Nvl(CUR_FRACTION,Cur_E_FRACTION),Nvl(Cur_E_FRACTION,Cur_FRACTION)),
		 Decode(Lang_No,1,Nvl(Cur_name,Cur_E_Name),Nvl(Cur_E_name,Cur_Name)),
		 Nvl(Cur_Frc_No,2)
	    Into     Frc_name	 ,
	      Curr_name   ,
	    V_Cur_Frc_No
	    From     Ex_rate
	    Where Cur_code = A_curr;
    Exception When Others Then
	Null;
    End;
--================================================
  Amnt_char := To_char (Amnt_num);
  Ln1 := Instr (Amnt_char, '.');

  If Ln1 > 0 Then
    Frac_char := Substr (Amnt_char, Ln1 + 1, 3);
    Amnt_char := Substr (Amnt_char, 1, Ln1 - 1);
  End If;

  Ln := Nvl (Nvl (Length (Amnt_char), 0), 0);
  Ln2 := Nvl (Nvl (Length (Frac_char), 0), 0);

  If Ln1 > 0 Then
    If V_Cur_Frc_No=3  Then
     Sub5 := Three_Digits_H(Rpad(Frac_Char,3,0));
    Else
     Sub5 := Two_Digits_H(Rpad(Frac_Char,2,0));
    End If;
  End If;

  If Ln = 1 Then
    Sub1 := One_digit (Amnt_char);
    Check_riyals (Amnt_char);
  Elsif Ln = 2 Then
    Sub1 := Two_digits (Amnt_char);
    Check_riyals (Amnt_char);
  Elsif Ln = 3 Then
    Sub1 := Three_digits (Amnt_char);
    Check_riyals (Substr (Amnt_char, 2, 2));
  Elsif Ln = 4 Then
    Sub1 := Four_digits (Amnt_char);
    Check_riyals (Substr (Amnt_char, 3, 2));
  Elsif Ln = 5 Then
    Sub1 := Five_digits (Amnt_char);
    Check_riyals (Substr (Amnt_char, 4, 2));
  Elsif Ln = 6 Then
    Sub1 := Six_digits (Amnt_char);
    Check_riyals (Substr (Amnt_char, 5, 2));
  Elsif Ln = 7 Then
    Sub1 := Seven_digits (Amnt_char);
    Check_riyals (Substr (Amnt_char, 6, 2));
  Elsif Ln = 8 Then
    Sub1 := Eight_digits (Amnt_char);
    Check_riyals (Substr (Amnt_char, 7, 2));
  Elsif Ln = 9 Then
    Sub1 := Nine_digits (Amnt_char);
    Check_riyals (Substr (Amnt_char, 8, 2));
  Elsif Ln = 10 Then
    Sub1 := Ten_digits (Amnt_char);
    Check_riyals (Substr (Amnt_char, 9, 2));
  Elsif Ln = 11 Then
    Sub1 := Eleven_digits (Amnt_char);
    Check_riyals (Substr (Amnt_char, 10, 2));
  Elsif Ln = 12 Then
    Sub1 := Twelve_digits (Amnt_char);
    Check_riyals (Substr (Amnt_char, 11, 2));
  Elsif Ln = 0 And Ln2 > 0 Then
    If V_Cur_Frc_No=3  Then
     Sub1 := Three_Digits_H(Rpad(Frac_Char,3,0));
    Else
     Sub1 := Two_Digits_H(Rpad(Frac_Char,2,0));
    End If;
  Else
    Return (Ias_gen_pkg.Get_prompt (Lang_no, 2600));
  End If;

  Return (Sub1);
End Tafkeet_F;
/
