-- =============================================
-- PACKAGE SPEC: GNR_GET_ITM_QR_CODE_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
package Gnr_Get_Itm_QR_Code_Pkg as
 Procedure Get_Itm_QR_Code_Data ( P_Itm_QR	   In Varchar2
				  , P_Itm_Code	     Out Ias_Itm_Mst.I_Code%Type
				  , P_Exp_Date	     Out Varchar2
				  , P_Btch_No	     Out Varchar2
				  , P_Srl_No	     Out Varchar2
				  , P_Mfg_Date	     Out Varchar2
				  , P_Cnt_Qty	     Out Number
				  , P_SSCC_Code      Out Varchar2
				  , P_Itm_Unt_Typ    In  Number
				  ) ;
Procedure Get_Itm_QR_Barcode_Prc ( P_Itm_QR	 In  Varchar2
				    , P_GTIN_Code   Out Varchar2
				    , P_Exp_Date    Out Date
				    , P_Btch_No     Out Varchar2
				    , P_Srl_No	    Out Varchar2
				    , P_Mfg_Date    Out Date
				    , P_Cnt_Qty     Out Number
				    , P_SSCC_Code   Out Varchar2
				    );

end Gnr_Get_Itm_QR_Code_Pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: GNR_GET_ITM_QR_CODE_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY Gnr_Get_Itm_QR_Code_Pkg AS
 Procedure Get_Itm_QR_Code_Data ( P_Itm_QR	   In Varchar2
			      , P_Itm_Code	 Out Ias_Itm_Mst.I_Code%Type
			      , P_Exp_Date	 Out Varchar2
			      , P_Btch_No	 Out Varchar2
			      , P_Srl_No	 Out Varchar2
			      , P_Mfg_Date	 Out Varchar2
			      , P_Cnt_Qty	 Out Number
			      , P_SSCC_Code	 Out Varchar2
			      , P_Itm_Unt_Typ	 In  Number
			      ) Is
  V_Cnt 	     Number;
  V_Gtn_Code	     Ias_Itm_Mst.Gtin_Code%Type;
  V_Itm_Code	     Ias_Itm_Mst.I_Code%Type;
  V_Use_QR_Code_Type Ias_Itm_Mst.Use_QR_Code_Type%Type;
  V_QR_Code_Mthd_No  Ias_Itm_Mst.QR_Code_Mthd_No%Type;
  V_Itm_Unt	     Ias_Itm_Dtl.Itm_Unt%Type;
  V_Idntfr	     Varchar2(10);
  V_Exp_Date	     Varchar2(10);
  V_Day 	     Varchar2(4);
  V_QR_Lngth	     Number:=0;
  V_Idcode_Lngth     Number:=0;
  V_Fld_Code	     Varchar2(10);
  V_Fld_Frmt	     Varchar2(10);
  V_DD_Loc	     Number(1);
  V_MM_Loc	     Number(1);
  V_YY_Loc	     Number(1);
Begin

   V_Gtn_Code := Substr(P_Itm_QR,3,14);

   Begin
	Select I_Code,
	       Use_QR_Code_Type,
	       QR_Code_Mthd_No
	  Into P_Itm_Code,
	       V_Use_QR_Code_Type,
	       V_QR_Code_Mthd_No
	From Ias_Itm_Mst
	 Where Gtin_Code = V_Gtn_Code ;

       V_Itm_Code := P_Itm_Code;

       If V_Use_QR_Code_Type = 2 And V_Itm_Code Is Not Null Then
	  Begin
	      Select
		   Itm_Unt,QR_Code_Mthd_No
	      Into
		   V_Itm_Unt,V_QR_Code_Mthd_No
	      From Ias_Itm_Dtl Where I_Code=V_Itm_Code
		 And (Case
			  When P_Itm_Unt_Typ=1 And Nvl(Main_Unit,0)=1 Then 1
			  When P_Itm_Unt_Typ=2 And Nvl(Sale_Unit,0)=1 Then 1
			  When P_Itm_Unt_Typ=3 And Nvl(Pur_Unit,0)=1 Then 1
			  When P_Itm_Unt_Typ=4 And P_Size =(Select Max(P_Size) From Ias_Itm_Dtl Where I_Code=V_Itm_Code And Rownum<=1) Then 1
			  Else 0 End)=1;
	  Exception
	    When Others Then
	     Null;
	  End;
       End If;
    Exception
      When Others Then
	Null;
    End;

    If V_QR_Code_Mthd_No Is Not Null Then --##CODE FROM TABLE INV_QR_CODE_MTHD_DTL
       If V_QR_Code_Mthd_No Is Not Null Then

	  Declare
	       Cursor C_QR Is Select Fld_Nm    ,
				     Fld_Lngth ,
				     Fld_Code  ,
				     Fld_Frmt
			       From Inv_QR_Code_Mthd_Dtl
				 Where Mthd_No = V_QR_Code_Mthd_No
				Order By Rcrd_No ;
	    Begin
		 For I In C_QR Loop

		       V_Idcode_Lngth := Length(I.Fld_Code);
		       V_QR_Lngth     := V_QR_Lngth+I.Fld_Lngth+Nvl(V_Idcode_Lngth,0);


		       If I.Fld_Nm=2 Then --## Exp date

			  V_Exp_Date := Substr(P_Itm_QR,V_QR_Lngth-I.Fld_Lngth+1,I.Fld_Lngth);
			  V_Exp_Date := Replace(V_Exp_Date,'/','');

			  If I.Fld_Frmt Is Not Null Then
			     V_Fld_Frmt:= Replace(I.Fld_Frmt,'/','');
			  Else
			     V_Fld_Frmt:='DDMMYY';
			  End If;

			  If V_Fld_Frmt Is Not Null Then
			     V_DD_Loc := Instr(V_Fld_Frmt,'D');
			     V_MM_Loc := Instr(V_Fld_Frmt,'M');
			     V_YY_Loc := Instr(V_Fld_Frmt,'Y');

			     If Nvl(V_DD_Loc,0)=0 Then
				V_Day := '01';
			     Else
				V_Day := Substr(V_Exp_Date,V_DD_Loc,2);
			     End If;

			    If Nvl(V_DD_Loc,0) = 0 Or Nvl(V_YY_Loc,0)=0 Then
			       Raise_Application_Error(-20003,'Error In format of date there are no year or month'||V_Fld_Frmt||Chr(13)||SqlErrm );
			    End If;

			    If I.Fld_Lngth In(8,10) Then
			       P_Exp_Date:=To_Date(V_Day||'/'||Substr(V_Exp_Date,V_MM_Loc,2)||'/'||Substr(V_Exp_Date,V_YY_Loc,4),'DD/MM/YYYY');
			    Else  --##I.Fld_lngth in 6 or 4

				Begin
				   P_Exp_Date := V_Day||'/'||Substr(V_Exp_Date,V_MM_Loc,2)||'/'||'20'||Substr(V_Exp_Date,V_YY_Loc,2);
				Exception
				   When Others Then
				     Raise_Application_Error(-20005,'Error When FORMMAT OF DATE'||V_Exp_Date||' V_Fld_frmt='||V_Fld_Frmt||Chr(13)||SqlErrm );
				End;
			    End If;
			  End If;
		       ElsIf I.Fld_Nm = 3 Then --## Btch
			  P_Btch_No := Substr(P_Itm_QR,V_QR_Lngth-I.Fld_Lngth+1,I.Fld_Lngth);
		       ElsIf I.Fld_Nm = 4 Then --## Srl
			  P_Srl_No := Substr(P_Itm_QR,V_QR_Lngth-I.Fld_Lngth+1,I.Fld_Lngth);
		       ElsIf I.Fld_Nm = 5 Then --## Mfg date
			    P_Mfg_Date := Substr(P_Itm_QR,V_QR_Lngth-I.Fld_Lngth+1,I.Fld_Lngth);
		       ElsIf I.Fld_Nm = 6 Then --## Qty
			    P_Cnt_Qty	  := Substr(P_Itm_QR,V_QR_Lngth-I.Fld_Lngth+1,I.Fld_Lngth);
		       End If;
		 End Loop;
	   Exception When Others Then
	     Raise_Application_Error(-20001,'Error When release  QR code I_code='||V_Itm_Code||' QR. Method_no='||V_QR_Code_Mthd_No||Chr(13)||Sqlerrm );
	   End;
      End If;
Else
	 Get_Itm_QR_Barcode_Prc ( P_Itm_QR	=> P_Itm_QR
				 , P_GTIN_Code	 => P_Itm_Code
				 , P_Exp_Date	 => P_Exp_Date
				 , P_Btch_No	 => P_Btch_No
				 , P_Srl_No	 => P_Srl_No
				 , P_Mfg_Date	 => P_Mfg_Date
				 , P_Cnt_Qty	 => P_Cnt_Qty
				 , P_SSCC_Code	 => P_SSCC_Code
				 ) ;
  End If;

End Get_Itm_QR_Code_Data ;
--##-------------------------------------------------------------------------##--
 Procedure Get_Itm_QR_Barcode_Prc( P_Itm_QR	 In  Varchar2
							, P_GTIN_Code	Out Varchar2
							, P_Exp_Date	Out Date
							, P_Btch_No	Out Varchar2
							, P_Srl_No	Out Varchar2
							, P_Mfg_Date	Out Date
							, P_Cnt_Qty	Out Number
							, P_SSCC_Code	Out Varchar2
							) Is
    V_L_Tmp	 Number    := 0 ;
    V_Itm_QR	 Varchar2(5000) ;
    V_Itm_QR_Tmp Varchar2(5000) ;
    V_SSCC_Code  Varchar2(100)	;
    V_GTIN_Code  Varchar2(100)	;
    V_Btch_No	 Varchar2(100)	;
    V_Exp_Date	 Varchar2(100)	;
    V_Mfg_Date	 Varchar2(100)	;
    V_Srl_No	 Varchar2(100)	;
    V_Othr_St	 Varchar2(100)	;
    V_Prt	 Varchar2(100)	;
    V_Prt_L	 Number 	;
    V_FNC1_Tmp	 Varchar2(250)	;
    V_FNC1	 Varchar2(250)	;
    V_Dy	 Varchar2(6)	;

 Begin

	  If Substr(P_Itm_QR,1,3) Not In (']C1',']e0',']d2',']Q3') Then
	     V_Itm_QR := ']d2'||P_Itm_QR;
	  Else
	     V_Itm_QR := P_Itm_QR;
	  End If;

	  V_Itm_QR_Tmp := V_Itm_QR;

	  V_FNC1_Tmp   := Substr(V_Itm_QR,1,3);

	  If V_Itm_QR Is Not Null And V_FNC1_Tmp In (']C1',']e0',']d2',']Q3') Then -- GS1 Data Matrix


	     While Length(V_Itm_QR) > 0 Loop

		  If Nvl(V_L_Tmp,0) > 0 Then
		     V_FNC1  :=  V_FNC1_Tmp;
		     V_L_Tmp := V_L_Tmp - 4;
		  End If;

		  If Substr(V_FNC1||V_Itm_QR,4,4) Not In ('(00)','(01)','(10)','(11)','(17)','(21)','(37)') Then
		      If Substr(V_FNC1||V_Itm_QR,4,2) = '00' Then -- SSCC

			 V_SSCC_Code := Substr(V_FNC1||V_Itm_QR,6,18) ; -- SSCC Obtaining 18 digits
			 V_Prt	:= V_FNC1_Tmp||'00'||V_SSCC_Code;

		      ElsIf Substr(V_FNC1||V_Itm_QR,4,2) = '01' Then -- GTIN

			 V_GTIN_Code := Substr(V_FNC1||V_Itm_QR,6,14) ; -- GTIN Obtaining 14 digits
			 V_Prt	:= V_FNC1_Tmp||'01'||V_GTIN_Code;

		      ElsIf Substr(V_FNC1||V_Itm_QR,4,2) = '10' Then -- Batch_NO

			-- Batch_No Obtaining Variable digits , Max 20 digits

			  V_Btch_No := Substr(V_FNC1||V_Itm_QR,6,Instr(V_FNC1||V_Itm_QR,Chr(29),1)-5) ;

			  If Nvl(Length(V_Btch_No),0) = 0 Then
			     V_Btch_No := Substr(V_FNC1||V_Itm_QR,6,Instr(V_FNC1||V_Itm_QR,Chr(32),1)-5) ;
			  End If;

			  V_Prt  := V_FNC1_Tmp||'10'||V_Btch_No;


			  If Nvl(Length(V_Btch_No),0) > 20  Or Nvl(Length(V_Btch_No),0) = 0 Then -- Cut 20 Digits
			      V_Btch_No := Substr(V_FNC1||V_Itm_QR,6,20) ;
			      V_Prt  := V_FNC1_Tmp||'10'||V_Btch_No;
			  End If;
				
		      ElsIf Substr(V_FNC1||V_Itm_QR,4,2) = '11' Then -- Production Date

			-- Production Date Obtaining 6 Digits
			V_Mfg_Date := Substr(V_FNC1||V_Itm_QR,6,6);

			V_Dy := Substr(V_Mfg_Date,5,6);

			If V_Dy = '00' Then
			   V_Dy := '01';
			End If;

			V_Mfg_Date:= Substr(V_Mfg_Date,1,4)||V_Dy;

			V_Prt  := V_FNC1_Tmp||'11'||V_Mfg_Date;

			--V_Prd_Date := To_Char(To_Date(V_Prd_Date,'YYMMDD'),'MON YYYY');
			V_Mfg_Date := To_Char(To_Date(V_Mfg_Date,'YYMMDD'),'DD/MM/YYYY');

		      ElsIf Substr(V_FNC1||V_Itm_QR,4,2) = '17' Then -- Expire Date

		      -- Expire Date Obtaining 6 Digits

			 V_Exp_Date := Substr(V_FNC1||V_Itm_QR,6,6);
			 V_Dy := Substr(V_Exp_Date,5,6);

			 If V_Dy = '00' Then
			    V_Dy := '01';
			 End If;

			 V_Exp_Date:= Substr(V_Exp_Date,1,4)||V_Dy;

			 V_Prt	:= V_FNC1_Tmp||'17'||V_Exp_Date;

			 --V_Exp_Date := To_Char(To_Date(V_Exp_Date,'YYMMDD'),'MON YYYY');
			 V_Exp_Date := To_Char(To_Date(V_Exp_Date,'YYMMDD'),'DD/MM/YYYY');

		      ElsIf Substr(V_FNC1||V_Itm_QR,4,2) = '21' Then -- Serial No

			-- Serial No Obtaining Variable digits , Max 20 digits

			  V_Srl_No := Substr(V_FNC1||V_Itm_QR,6,Instr(V_FNC1||V_Itm_QR,Chr(29),1)-5) ;

			  If Nvl(Length(V_Srl_No),0) = 0 Then
			    V_Srl_No := Substr(V_FNC1||V_Itm_QR,6,Instr(V_FNC1||V_Itm_QR,Chr(32),1)-5) ;
			  End If;

			  V_Prt  := V_FNC1_Tmp||'21'||V_Srl_No;

				
			  If Nvl(Length(V_Srl_No),0) > 20  Or Nvl(Length(V_Srl_No),0) = 0 Then -- Cut 20 Digits
			     V_Srl_No := Substr(V_FNC1||V_Itm_QR,6,20) ;
			     V_Prt  := V_FNC1_Tmp||'21'||V_Srl_No;

			  End If;
				
				
		      ElsIf Substr(V_FNC1||V_Itm_QR,4,2) Not In  ('00','01','10','11','17','21','37') Then

			  V_Othr_St := Substr(V_FNC1||V_Itm_QR,6,Instr(V_FNC1||V_Itm_QR,Chr(29),1)-5) ;
			  V_Prt  := V_FNC1_Tmp||Substr(V_FNC1||V_Itm_QR,4,2)||V_Othr_St;

		      End If;
		  Else

		      If Substr(V_FNC1||V_Itm_QR,4,4) = '(00)' Then -- SSCC

			 V_SSCC_Code := Substr(V_FNC1||V_Itm_QR,8,18) ; -- SSCC Obtaining 18 digits
			 V_Prt	:= V_FNC1_Tmp||'(00)'||V_SSCC_Code;

		      ElsIf Substr(V_FNC1||V_Itm_QR,4,4) = '(01)' Then -- GTIN

			 V_GTIN_Code := Substr(V_FNC1||V_Itm_QR,8,14) ; -- GTIN Obtaining 14 digits
			 V_Prt	:= V_FNC1_Tmp||'(01)'||V_GTIN_Code;

		      ElsIf Substr(V_FNC1||V_Itm_QR,4,4) = '(10)' Then -- Batch_NO

			-- Batch_No Obtaining Variable digits , Max 20 digits

			  V_Btch_No := Substr(V_FNC1||V_Itm_QR,8,Instr(V_FNC1||V_Itm_QR,'(',1,2)-8) ;
			  V_Prt  := V_FNC1_Tmp||'(10)'||V_Btch_No;
				
				
			  If Nvl(Length(V_Btch_No),0) > 20  Or Nvl(Length(V_Btch_No),0) = 0 Then -- Cut 20 Digits
			      V_Btch_No := Substr(V_FNC1||V_Itm_QR,8,20) ;
			      V_Prt  := V_FNC1_Tmp||'(10)'||V_Btch_No;
			  End If;

		      ElsIf Substr(V_FNC1||V_Itm_QR,4,4) = '(11)' Then -- Production Date

			-- Production Date Obtaining 6 Digits
			V_Mfg_Date := Substr(V_FNC1||V_Itm_QR,8,6);

			V_Dy := Substr(V_Mfg_Date,5,6);

			If V_Dy = '00' Then
			   V_Dy := '01';
			End If;

			V_Mfg_Date:= Substr(V_Mfg_Date,1,4)||V_Dy;

			V_Prt  := V_FNC1_Tmp||'(11)'||V_Mfg_Date;

			--V_Prd_Date := To_Char(To_Date(V_Prd_Date,'YYMMDD'),'MON YYYY');
			V_Mfg_Date := To_Char(To_Date(V_Mfg_Date,'YYMMDD'),'DD/MM/YYYY');

		      ElsIf Substr(V_FNC1||V_Itm_QR,4,4) = '(17)' Then -- Expire Date

		      -- Expire Date Obtaining 6 Digits

			 V_Exp_Date := Substr(V_FNC1||V_Itm_QR,8,6);
			 V_Dy := Substr(V_Exp_Date,5,6);

			 If V_Dy = '00' Then
			    V_Dy := '01';
			 End If;

			 V_Exp_Date:= Substr(V_Exp_Date,1,4)||V_Dy;

			 V_Prt	:= V_FNC1_Tmp||'(17)'||V_Exp_Date;

			 --V_Exp_Date := To_Char(To_Date(V_Exp_Date,'YYMMDD'),'MON YYYY');
			 V_Exp_Date := To_Char(To_Date(V_Exp_Date,'YYMMDD'),'DD/MM/YYYY');

		      ElsIf Substr(V_FNC1||V_Itm_QR,4,4) = '(21)' Then -- Serial No

			-- Serial No Obtaining Variable digits , Max 20 digits

			  V_Srl_No := Substr(V_FNC1||V_Itm_QR,8,Instr(V_FNC1||V_Itm_QR,'(',1,2)-8) ;

			  V_Prt  := V_FNC1_Tmp||'(21)'||V_Srl_No;
				
				If Substr(V_Itm_QR,5,1) <> '('
				Then
				  If Nvl(Length(V_Srl_No),0) > 20  Or Nvl(Length(V_Srl_No),0) = 0 Then -- Cut 20 Digits
				     V_Srl_No := Substr(V_FNC1||V_Itm_QR,8,20) ;
				     V_Prt  := V_FNC1_Tmp||'(21)'||V_Srl_No;
	
				  End If;
				End If;
				
		      ElsIf Substr(V_FNC1||V_Itm_QR,4,4) Not In  ('(00)','(01)','(10)','(11)','(17)','(21)','(37)') Then

			  V_Othr_St := Substr(V_FNC1||V_Itm_QR,8,Instr(V_FNC1||V_Itm_QR,'(',1,2)-8) ;
			  V_Prt  := V_FNC1_Tmp||Substr(V_FNC1||V_Itm_QR,6,2)||V_Othr_St;

		      End If;

		  End If;

		  V_Prt_L := Length(V_Prt);


		  V_L_Tmp := Nvl(V_L_Tmp,0) + ( Nvl(V_Prt_L,0) + 1 );

		  V_Itm_QR := Substr(V_Itm_QR_Tmp,V_L_Tmp);

	     End Loop;
	  Else
	    -- Show Message , Not GS1 Symbology Using GS1 AIs Or String Is Empty
	    Null;
	  End If;

	  P_SSCC_Code  := Rtrim(V_SSCC_Code,chr(29));
	  P_GTIN_Code  := Rtrim(V_GTIN_Code,chr(29));
	  P_Btch_No    := Rtrim(V_Btch_No,chr(29));
	  P_Exp_Date   := Rtrim(V_Exp_Date,chr(29));
	  P_Mfg_Date   := Rtrim(V_Mfg_Date,chr(29));
	  P_Srl_No     := Rtrim(V_Srl_No,chr(29));

 End Get_Itm_QR_Barcode_Prc;

End Gnr_Get_Itm_QR_Code_Pkg;
/
