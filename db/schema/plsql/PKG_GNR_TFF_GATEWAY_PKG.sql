-- =============================================
-- PACKAGE SPEC: GNR_TFF_GATEWAY_PKG  (status: VALID)
-- =============================================
CREATE OR REPLACE
PACKAGE GNR_TFF_GATEWAY_PKG IS
--##Global variables declaration------------------------------------------------
G_BASE_URL		VARCHAR2(250) := 'http://localhost:5050';
G_LANG_NO		NUMBER := 1;
G_USERNAME		VARCHAR2(100);
G_PASSWORD		VARCHAR2(100);


--##----------------------------------------------------------------------------
PROCEDURE LAUNCH_CONTEXT(P_DOC_TYPE   IN    NUMBER		   ,
			 P_DOC_SER    IN    VARCHAR2		   ,
			 P_BRN_NO     IN    NUMBER		   ,
			 P_C_CODE     IN    VARCHAR2		   ,
			 P_LANG_NO    IN    NUMBER DEFAULT 1	   ,
			 P_CNTRY_CODE IN    VARCHAR2 DEFAULT 'SAU' ,
			 P_LAUNCH_URL OUT   VARCHAR2);

--##----------------------------------------------------------------------------
PROCEDURE VOID(P_BRN_NO 	IN  NUMBER,
	       P_DOC_ID 	IN  VARCHAR2,
	       P_TOTAL_AMT	IN  NUMBER,
	       P_SHOP_ID	IN  VARCHAR2 DEFAULT NULL,
	       P_DESK_ID	IN  VARCHAR2 DEFAULT NULL,
	       P_SHOP_ASSISTANT IN  VARCHAR2 DEFAULT NULL,
	       P_TILL		IN  VARCHAR2 DEFAULT NULL,
	       P_POS_TYPE	IN  VARCHAR2 DEFAULT NULL,
	       P_SENDER_ID	IN  VARCHAR2 DEFAULT 'OnyxErp Pos v8.2',
	       P_CREDIT_NOTE_NO IN   VARCHAR2 DEFAULT NULL);

--##----------------------------------------------------------------------------
PROCEDURE SEARCH_TRANSACTIONS(P_RECEIPT_NO	    IN	VARCHAR2    DEFAULT NULL,
			      P_TORST_FRST_NM	    IN	VARCHAR2    DEFAULT NULL,
			      P_TORST_LST_NM	    IN	VARCHAR2    DEFAULT NULL,
			      P_TORST_PASSPORT_NO   IN	VARCHAR2    DEFAULT NULL,
			      P_FROM_ISSUE_DATE     IN	DATE	    DEFAULT NULL,
			      P_TO_ISSUE_DATE	    IN	DATE	    DEFAULT NULL,
			      P_SHOP_ID 	    IN	VARCHAR2    DEFAULT NULL,
			      P_DESK_ID 	    IN	VARCHAR2    DEFAULT NULL,
			      P_SHOP_ASSISTANT	    IN	VARCHAR2    DEFAULT NULL,
			      P_TILL		    IN	VARCHAR2    DEFAULT NULL,
			      P_POS_TYPE	    IN	VARCHAR2    DEFAULT NULL,
			      P_DOC_ID		    OUT VARCHAR2);
--##----------------------------------------------------------------------------
PROCEDURE CHECK_DOC_STATUS(P_DOC_ID	IN  VARCHAR2,
			   P_DOC_STATUS OUT VARCHAR2);

--##----------------------------------------------------------------------------
FUNCTION IS_DOC_VOIDABLE(P_DOC_ID     IN  VARCHAR2) RETURN BOOLEAN;
--##----------------------------------------------------------------------------
FUNCTION GET_PDF(P_BRN_NO	IN  NUMBER,
		 P_DOC_ID	IN  VARCHAR2) RETURN BLOB;
--##----------------------------------------------------------------------------
PROCEDURE SET_WEB_SRVC_PRMTR(P_BRN_NO	  IN	  NUMBER);
--##----------------------------------------------------------------------------
PROCEDURE CALL_API(P_URL		IN	VARCHAR2,
		   P_METHOD		IN	VARCHAR2,
		   P_CONTENT		IN	VARCHAR2,
		   P_CONTENT_TYPE	IN	VARCHAR2,
		   P_HTTP_STATUS_CODE	OUT	NUMBER,
		   P_RESPONSE		OUT	CLOB);
PROCEDURE EXPRT_BLOB_TO_PDF (P_BRN_NO	     IN  NUMBER,
			     P_DOC_ID	     IN  VARCHAR2,
			     P_DIR_NM	     IN VARCHAR2,
			     P_FILE_NM	     IN VARCHAR2 );

END GNR_TFF_GATEWAY_PKG;
/

-- ---------------------------------------------
-- PACKAGE BODY: GNR_TFF_GATEWAY_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY GNR_TFF_GATEWAY_PKG IS
--##----------------------------------------------------------------------------
PROCEDURE LAUNCH_CONTEXT(P_DOC_TYPE   IN    NUMBER		   ,
			 P_DOC_SER    IN    VARCHAR2		   ,
			 P_BRN_NO     IN    NUMBER		   ,
			 P_C_CODE     IN    VARCHAR2		   ,
			 P_LANG_NO    IN    NUMBER DEFAULT 1	   ,
			 P_CNTRY_CODE IN    VARCHAR2 DEFAULT 'SAU' ,
			 P_LAUNCH_URL OUT   VARCHAR2)
IS
V_E_ENV_JSON	    CLOB;
V_REQUEST	    CLOB;
V_C_DOB 	    DATE;
V_URL		    VARCHAR2(100) := '/api/integration/launch-context';
V_HTTP_STATUS_CODE  NUMBER;
V_RESPONSE	    CLOB;
BEGIN
    SET_WEB_SRVC_PRMTR(P_BRN_NO);

    V_E_ENV_JSON := YS_JSON_PKG.GNRT_E_INVC_JSON(P_DOC_TYPE	=> P_DOC_TYPE,
						 P_DOC_SER	=> P_DOC_SER,
						 P_OUT_TYP	=> 0,
						 P_UNISTR	=> 0,
						 P_LANG_NO	=> 2,
						 P_CNTRY_CODE	=> P_CNTRY_CODE);

    --V_E_ENV_JSON := '{"ProfileID":"reporting 1.0","ID":"25030040000009","UUID":"","IssueDateTime":"2026-03-17T15:11:08Z","InvoiceTypeCode":"388","InvoiceTransactionCode":"0100000","Note":["?????? ?????"],"DocumentCurrencyCode":"SAR","DocumentCurrencyExRate":1,"TaxCurrencyCode":"SAR","TaxCurrencyExRate":1,"LineCountNumeric":1,"SalesOrderID":null,"SalesOrderDescription":null,"PurchaseOrderID":null,"PurchaseOrderDescription":"?????? ?????","BillingreferenceID":null,"DespatchDocumentReference":null,"ReceiptDocumentReference":null,"OriginatorDocumentReference":null,"ContractDocumentReference":null,"ContractID":null,"CopyIndicator":null,"AccountingCost":null,"AdditionalDocumentReferences":null,"CurrencyExchangeRates":null,"AccountingSupplierParty":{"Party":{"IndustryClassificationCode":{"Value":null,"Name":null},"PartyIdentification":[{"ID":{"Value":"121212121","SchemeID":"CRN"}}],"PostalAddress":{"AddressLine":null,"StreetName":"???? 1","AdditionalStreetName":null,"BuildingNumber":"21254","PlotIdentification":"2154","CitySubdivisionName":"???????","CitySubdivisionNo":1,"CityName":"???","CityNo":1,"PostalZone":"2154","CountrySubentity":"???????	???????","CountrySubentityNo":1,"Country":"SAU","CountryNo":1,"Floor":null,"Room":null,"MobileNo":null,"InvoiceTransactionCodeType":null},"Contact":{"Telephone":null,"ElectronicMail":null},"PartyTaxScheme":{"CompanyID":"300075588700003","TaxScheme":"VAT","VatNumber":null},"PartyLegalEntity":"????  ?????? 2","BranchCode":null,"SyndicateLicenseNumber":null,"ActivityCode":null,"PartyType":null}},"AccountingCustomerParty":{"Party":{"IndustryClassificationCode":null,"PartyIdentification":[{"ID":{"Value":"121212121","SchemeID":"PASSPORT"}}],"PostalAddress":{"AddressLine":null,"StreetName":"Giza","AdditionalStreetName":null,"BuildingNumber":"21221","PlotIdentification":"1224","CitySubdivisionName":"?? ?????? ????","CitySubdivisionNo":8,"CityName":"Cairo","CityNo":1,"PostalZone":"34552","CountrySubentity":"Cairo","CountrySubentityNo":1,"Country":"EGY","CountryNo":1,"Floor":null,"Room":null,"MobileNo":null,"InvoiceTransactionCodeType":"B2B"},"Contact":{"Telephone":"771393436","ElectronicMail":"yas_hezam@yahoo.com"},"PartyTaxScheme":{"CompanyID":"312563245236983","TaxScheme":"VAT","VatNumber":null},"PartyLegalEntity":"Yaser Hezam","BranchCode":null,"SyndicateLicenseNumber":null,"ActivityCode":null,"PartyType":null}},"Delivery":{"ActualDeliveryDate":"2026-03-12T00:00:00Z","LatestDeliveryDate":null},"PaymentMeans":{"PaymentMeansCode":"10","InstructionNote":[null],"PaymentNote":null,"PayeeFinancialAccount":null,"BankName":null,"BankAddress":null,"BankAccountNo":null,"BankSwiftCode":null,"CollectorName":null},"AllowanceCharge":[],"TaxTotal":{"TaxAmount":{"Value":150,"CurrencyID":"SAR"},"TaxAmountLocal":{"Value":150,"CurrencyID":"SAR"},"TaxSubtotal":[{"TaxableAmount":{"Value":1000,"CurrencyID":"SAR"},"TaxAmount":{"Value":150,"CurrencyID":"SAR"},"TaxCategory":{"ID":"S","Percent":15,"TaxScheme":"VAT","TaxExemptionReasonCode":null,"TaxExemptionReason":null}}],"RoundingAmount":null},"WithholdingTaxTotal":null,"LegalMonetaryTotal":{"LineExtensionAmount":{"Value":1000,"CurrencyID":"SAR"},"TaxExclusiveAmount":{"Value":1000,"CurrencyID":"SAR"},"TaxInclusiveAmount":{"Value":1150,"CurrencyID":"SAR"},"AllowanceTotalAmount":{"Value":0,"CurrencyID":"SAR"},"ChargeTotalAmount":{"Value":0,"CurrencyID":"SAR"},"PrepaidAmount":{"Value":0,"CurrencyID":"SAR"},"PayableAmount":{"Value":1150,"CurrencyID":"SAR"}},"InvoiceLine":[{"ID":"1","InvoicedQuantity":{"Value":1,"UnitCode":"1*1"},"LineExtensionAmount":{"Value":1000,"CurrencyID":"SAR"},"DocumentReference":null,"AllowanceCharge":[],"TaxTotal":{"TaxAmount":{"Value":150,"CurrencyID":"SAR"},"TaxAmountLocal":null,"TaxSubtotal":[{"TaxableAmount":{"Value":1000,"CurrencyID":"SAR"},"TaxAmount":{"Value":150,"CurrencyID":"SAR"},"TaxCategory":{"ID":"S","Percent":15,"TaxScheme":"VAT","TaxExemptionReasonCode":null,"TaxExemptionReason":null}}],"RoundingAmount":{"Value":1150,"CurrencyID":"S
AR"}},"Item":{"Name":"ITEM TEST 100","BuyersItemIdentification":null,"SellersItemIdentification":"KB12370","StandardItemIdentification":null,"ItemClassificationCode":"JOY","Description":null,"ClassifiedTaxCategory":{"ID":"S","Percent":15,"TaxScheme":"VAT","TaxExemptionReasonCode":null,"TaxExemptionReason":null}},"Price":{"PriceAmount":{"Value":1000,"CurrencyID":"SAR"},"BaseQuantity":{"Value":1,"UnitCode":"1*1"},"AllowanceCharge":null}}]}';

    BEGIN
	SELECT BRTH_DATE
	INTO   V_C_DOB
	FROM (
	    SELECT BRTH_DATE
	      FROM CUSTOMER
	     WHERE C_CODE = P_C_CODE
	    UNION ALL
	    SELECT BIRTH_DATE
	      FROM IAS_CASH_CUSTMR
	     WHERE CUST_CODE = P_C_CODE);

	DBMS_OUTPUT.PUT_LINE('DOB='||V_C_DOB);
    EXCEPTION WHEN OTHERS THEN
	V_C_DOB := NULL;
    END;

    FOR I IN (
    SELECT *
    FROM JSON_TABLE(V_E_ENV_JSON, '$' Columns(
	ID			VARCHAR2(30)	PATH '$.ID',
	IssueDateTime		VARCHAR2(50)	PATH '$.IssueDateTime',

	BRANCH_CODE		VARCHAR2(50)	PATH '$.AccountingSupplierParty.Party.BranchCode',

	TRVLR_ADD_STR		VARCHAR2(100)	PATH '$.AccountingCustomerParty.Party.PostalAddress.StreetName',
	TRVLR_ADD_STATE 	VARCHAR2(100)	PATH '$.AccountingCustomerParty.Party.PostalAddress.CountrySubentity',
	TRVLR_ADD_CITY		VARCHAR2(100)	PATH '$.AccountingCustomerParty.Party.PostalAddress.CityName',
	TRVLR_ADD_ZIP		VARCHAR2(100)	PATH '$.AccountingCustomerParty.Party.PostalAddress.PostalZone',

	TRVLR_DOC_TYPE		VARCHAR2(100)	PATH '$.AccountingCustomerParty.Party.PartyIdentification[0].ID.SchemeID',
	TRVLR_DOC_NUMBER	VARCHAR2(100)	PATH '$.AccountingCustomerParty.Party.PartyIdentification[0].ID.Value',
	--TRVLR_DOC_EXP_DATE	  VARCHAR2(100)   PATH '$.AccountingCustomerParty.Party.PostalAddress.PostalZone',
	TRVLR_DOC_CNTRY 	VARCHAR2(100)	PATH '$.AccountingCustomerParty.Party.PostalAddress.Country',

	TRVLR_NAME		VARCHAR2(100)	PATH '$.AccountingCustomerParty.Party.PartyLegalEntity',
	TRVLR_VAT		VARCHAR2(100)	PATH '$.AccountingCustomerParty.Party.PartyTaxScheme.CompanyID',
	TRVLR_MOBILE		VARCHAR2(100)	PATH '$.AccountingCustomerParty.Party.Contact.Telephone',
	TRVLR_EMAIL		VARCHAR2(100)	PATH '$.AccountingCustomerParty.Party.Contact.ElectronicMail',

	PAYMENT_MEANS_CODE	VARCHAR2(100)	PATH '$.PaymentMeans.PaymentMeansCode',

	PAYABLE_AMOUNT		NUMBER		PATH '$.LegalMonetaryTotal.PayableAmount.Value',
	TOTAL_TAX_AMOUNT	NUMBER		PATH '$.TaxTotal.TaxAmount.Value'
	)))
    LOOP
	--DBMS_OUTPUT.PUT_LINE(I.ID);
	APEX_JSON.INITIALIZE_CLOB_OUTPUT;
	APEX_JSON.OPEN_OBJECT; --{
	    APEX_JSON.WRITE('action',	      'issuesilent');
	    APEX_JSON.WRITE('language',       CASE P_LANG_NO WHEN 1 THEN 'ar' ELSE 'en' END);
	    APEX_JSON.OPEN_OBJECT('issueModel');--"issueModel"{
		APEX_JSON.OPEN_OBJECT('traveller');--"traveller"{
		    APEX_JSON.OPEN_OBJECT('address');--"address"{
			APEX_JSON.WRITE('street',      I.TRVLR_ADD_STR);
			APEX_JSON.WRITE('state',       I.TRVLR_ADD_STATE);
			APEX_JSON.WRITE('city',        I.TRVLR_ADD_CITY);
			APEX_JSON.WRITE('zip',	       I.TRVLR_ADD_ZIP);
		    APEX_JSON.CLOSE_OBJECT;--}

		    APEX_JSON.OPEN_OBJECT('travelDocument');--"travelDocument"{
			APEX_JSON.WRITE('documentType', 	I.TRVLR_DOC_TYPE);
			APEX_JSON.WRITE('documentNumber',	I.TRVLR_DOC_NUMBER);
			--APEX_JSON.WRITE('documentExpiryDate',   '');	OPTIONAL
			APEX_JSON.OPEN_OBJECT('documentCountry');
			    APEX_JSON.WRITE('alpha3Code',	I.TRVLR_DOC_CNTRY);
			APEX_JSON.CLOSE_OBJECT;
		    APEX_JSON.CLOSE_OBJECT;--}

		    --APEX_JSON.WRITE('gender', 	     'Male');
		    --APEX_JSON.WRITE('title',		      I.TRVLR_DOC_TYPE);--The title of the tourist (e.g. Mr, Mrs, Miss).
		    APEX_JSON.WRITE('firstName',	    REGEXP_SUBSTR(I.TRVLR_NAME, '[^ ]+', 1, 1, 'c'));
		    APEX_JSON.WRITE('lastName', 	    REGEXP_SUBSTR(I.TRVLR_NAME, '[^ ]+$', 1, 1, 'c'));
		    APEX_JSON.WRITE('taxRegistrationNumber',I.TRVLR_VAT);
		    APEX_JSON.WRITE('mobileNumber',	    I.TRVLR_MOBILE);
		    APEX_JSON.WRITE('email',		    I.TRVLR_EMAIL);
		    APEX_JSON.WRITE('statusOfResidence',    'Tourist');
		    APEX_JSON.OPEN_OBJECT('countryOfResidence');
			APEX_JSON.WRITE('alpha3Code',	    I.TRVLR_DOC_CNTRY);
		    APEX_JSON.CLOSE_OBJECT;

		    APEX_JSON.WRITE('dateOfBirth',    V_C_DOB);--The Date of Birth of the tourist.? Date-only format (preferred format): ISO 8601 Date Format YYYY-MM-DD ? Date and time format: ISO 8601 Date	Format YYYY-MM-DDTHH:MM:SSZ
		    APEX_JSON.OPEN_OBJECT('nationality');
			APEX_JSON.WRITE('alpha3Code',	    I.TRVLR_DOC_CNTRY);
		    APEX_JSON.CLOSE_OBJECT;
		    --APEX_JSON.WRITE('travellerIdentifier',	''); -- Tourists Identifier Token. Identification used to get registered GB profile of the tourist.
								     -- GBIdentifier/PassportNumber/PhoneNumber/CreditCardToken.
								     -- Prefix needs to be appended for identification types:
								     --   ? GB Identifier = G+<identifier> (e.g. GB Identifier : G+3086123456781234)
								     --   ? Passport = I + <countrycode>+<Passportnumber> For countrycode please use the ISO 3166-1 numeric country list (exception for Germany - use 280).(e.g. Passport : I+643+A12345678)
								     --   ? Phonenumber = M+<mobilenumber> Please include the international number prefix (e.g. 01 for US, 0043 for Austria).(e.g. PhoneNumber: M+01234567890)

		    APEX_JSON.OPEN_ARRAY('customParameters');
		    APEX_JSON.CLOSE_ARRAY;
		APEX_JSON.CLOSE_OBJECT;--}

		APEX_JSON.OPEN_OBJECT('trip');-- "trip"{ OPTIONAL
		    APEX_JSON.WRITE('portOfEntry',	'');
		    APEX_JSON.WRITE('arrivalDate',	'');
		    APEX_JSON.WRITE('departureDate',	'');
		    APEX_JSON.OPEN_OBJECT('finalDestinationCountry');-- "finalDestinationCountry"{
			APEX_JSON.WRITE('alpha3Code',	'');
		    APEX_JSON.CLOSE_OBJECT;
		APEX_JSON.CLOSE_OBJECT;

		APEX_JSON.OPEN_OBJECT('shop');-- "shop"{ MANDATOY
		    APEX_JSON.WRITE('shopId',	    '');
		    APEX_JSON.WRITE('deskId',	    '');
		    APEX_JSON.WRITE('shopAssistant','');
		    APEX_JSON.WRITE('till',	    '');
		APEX_JSON.CLOSE_OBJECT;

		APEX_JSON.OPEN_OBJECT('purchase'); --"purchase"{
		    APEX_JSON.OPEN_ARRAY('receipts');
			APEX_JSON.OPEN_OBJECT;
			    APEX_JSON.WRITE('receiptNumber',	I.ID);
			    APEX_JSON.WRITE('receiptDate',	I.IssueDateTime);

			    APEX_JSON.OPEN_OBJECT('totalAmount');--"totalAmount"{
				APEX_JSON.WRITE('grossAmount',	    I.PAYABLE_AMOUNT);
				APEX_JSON.WRITE('netAmount',	    I.PAYABLE_AMOUNT - I.TOTAL_TAX_AMOUNT);
				APEX_JSON.WRITE('vatAmount',	    I.TOTAL_TAX_AMOUNT);
			    APEX_JSON.CLOSE_OBJECT;

			    APEX_JSON.OPEN_ARRAY('totalsPerVat');
				FOR J IN (SELECT *
					  FROM JSON_TABLE(V_E_ENV_JSON, '$.TaxTotal.TaxSubtotal[*]' Columns(
					    TAX_AMOUNT			    NUMBER    PATH '$.TaxAmount.Value',
					    TAXABLE_AMOUNT		    NUMBER    PATH '$.TaxableAmount.Value',
					    TAX_PERCENT 		    NUMBER    PATH '$.TaxCategory.Percent')))
				LOOP
				    APEX_JSON.OPEN_OBJECT;
					APEX_JSON.WRITE('vatRate',	  J.TAX_PERCENT);
					APEX_JSON.OPEN_OBJECT('totalAmount');--"totalAmount"{
					    APEX_JSON.WRITE('grossAmount',	J.TAXABLE_AMOUNT + J.TAX_AMOUNT);
					    APEX_JSON.WRITE('netAmount',	J.TAXABLE_AMOUNT);
					    APEX_JSON.WRITE('vatAmount',	J.TAX_AMOUNT);
					APEX_JSON.CLOSE_OBJECT;
				    APEX_JSON.CLOSE_OBJECT;
				END LOOP;

			    APEX_JSON.CLOSE_ARRAY;

			    APEX_JSON.OPEN_ARRAY('purchaseItems');--"purchaseItems"{
				FOR J IN (SELECT *
					  FROM JSON_TABLE(V_E_ENV_JSON, '$.InvoiceLine[*]' Columns(
					    LINE_EXTENSION_AMOUNT	    NUMBER	    PATH '$.LineExtensionAmount.Value',
					    INVOICED_QTY		    NUMBER	    PATH '$.InvoicedQuantity.Value',
					    UNIT_CODE			    VARCHAR2(100)   PATH '$.InvoicedQuantity.UnitCode',
					    ITEM_CODE			    VARCHAR2(100)   PATH '$.Item.SellersItemIdentification',
					    ITEM_NAME			    VARCHAR2(100)   PATH '$.Item.Name',
					    ITEM_DESCRIPTION		    VARCHAR2(100)   PATH '$.Item.Description',
					    ITEM_CATEGORY		    VARCHAR2(100)   PATH '$.Item.Category',
					    ITEM_CLASSIFICATION_CODE	    VARCHAR2(100)   PATH '$.Item.ItemClassificationCodeGlblBlu',--NEED TO BE REVIEWED
					    TAX_AMOUNT			    NUMBER    PATH '$.TaxTotal.TaxAmount.Value',
					    ROUNDING_AMOUNT		    NUMBER    PATH '$.TaxTotal.RoundingAmount.Value',
					    TAX_PERCENT 		    NUMBER    PATH '$.Item.ClassifiedTaxCategory.Percent'
					    )))
				LOOP
				    APEX_JSON.OPEN_OBJECT;
					APEX_JSON.WRITE('vatRate',	  J.TAX_PERCENT);

					APEX_JSON.OPEN_OBJECT('amount');--"totalAmount"{
					    APEX_JSON.WRITE('grossAmount',	J.ROUNDING_AMOUNT);
					    APEX_JSON.WRITE('netAmount',	J.LINE_EXTENSION_AMOUNT);
					    APEX_JSON.WRITE('vatAmount',	J.TAX_AMOUNT);
					APEX_JSON.CLOSE_OBJECT;

					APEX_JSON.OPEN_OBJECT('unitAmount');--"totalAmount"{
					    APEX_JSON.WRITE('grossAmount',	ROUND(J.ROUNDING_AMOUNT / J.INVOICED_QTY,2));
					    APEX_JSON.WRITE('netAmount',	ROUND(J.LINE_EXTENSION_AMOUNT / J.INVOICED_QTY,2));
					    APEX_JSON.WRITE('vatAmount',	ROUND(J.TAX_AMOUNT / J.INVOICED_QTY,2));
					APEX_JSON.CLOSE_OBJECT;

					APEX_JSON.WRITE('quantity',		    J.INVOICED_QTY);
					APEX_JSON.WRITE('unitQuantity', 	    1);
					APEX_JSON.WRITE('goodDescription',	    J.ITEM_NAME);
					APEX_JSON.WRITE('goodDetailDescription',    J.ITEM_DESCRIPTION);
					APEX_JSON.WRITE('goodCategory', 	    J.ITEM_CATEGORY);
					APEX_JSON.WRITE('goodCustomsClassification',J.ITEM_CLASSIFICATION_CODE); --NEED TO BE REVIEWED (EITHER USING IT OR GET IT FROM THE GROUP)
														--Mandatory to be provided.
														-- All goods must be mapped according to following list whereby the related Code
														--  value must be provided in the Issue Form request for each good item:
														-- o CUL ... Cultural goods and handicrafts
														-- o DEP ... Sports and leisure
														-- o EDM ... Household appliances
														-- o HOG ... Home and decoration
														-- o ELI ... Computers and electronics
														-- o MOD ... Fashion and accessories
														-- o PER ... Perfumes, cosmetics and pharmaceuticals
														-- o JOY ... Watches & Jewellery
					APEX_JSON.WRITE('measurementUnit',	    J.UNIT_CODE);
					--APEX_JSON.WRITE('serialNumber',	      ''); -- ITEM SERIAL NUMBER
											   --Strongly Recommended for Watches and Jewelry.
					APEX_JSON.WRITE('productCode',		    J.ITEM_CODE);
					--APEX_JSON.WRITE('masterAmount',	      );
					APEX_JSON.OPEN_ARRAY('customParameters');
					APEX_JSON.CLOSE_ARRAY;

				    APEX_JSON.CLOSE_OBJECT;
				END LOOP;
			    APEX_JSON.CLOSE_ARRAY;

			    APEX_JSON.WRITE('till',		 '');--OPTIONAL TILL CODE
			    APEX_JSON.WRITE('storeCode',	 I.BRANCH_CODE); --
			    APEX_JSON.WRITE('barcodeContent',	 '');

			APEX_JSON.CLOSE_OBJECT;
		    APEX_JSON.CLOSE_ARRAY;

		    APEX_JSON.OPEN_ARRAY('purchasePaymentMethod');
			APEX_JSON.WRITE(CASE I.PAYMENT_MEANS_CODE WHEN 10 THEN 'Cash' WHEN 48 THEN 'Credit' ELSE 'Other' end);
		    APEX_JSON.CLOSE_ARRAY;
		APEX_JSON.CLOSE_OBJECT;


		APEX_JSON.WRITE('externalDocumentReference', '');

		APEX_JSON.OPEN_OBJECT('refund'); --"refund"{
		    APEX_JSON.WRITE('shopTakesRisk', FALSE);
		    APEX_JSON.OPEN_OBJECT('travellerFee');--"travellerFee"{
		    APEX_JSON.CLOSE_OBJECT;
		APEX_JSON.CLOSE_OBJECT;

		APEX_JSON.OPEN_ARRAY('customParameters');
		APEX_JSON.CLOSE_ARRAY;

		APEX_JSON.WRITE('issuingWorkflow', 'issue');
		APEX_JSON.WRITE('afterSales', FALSE);
		APEX_JSON.WRITE('senderId', 'OnyxErp Pos v8.2');
	    APEX_JSON.CLOSE_OBJECT;--}
	APEX_JSON.CLOSE_OBJECT;--}
    END LOOP;

    V_REQUEST := APEX_JSON.GET_CLOB_OUTPUT;
    APEX_JSON.FREE_OUTPUT;

    DBMS_OUTPUT.PUT_LINE(V_REQUEST);


    CALL_API(P_URL		=> G_BASE_URL || V_URL,
	     P_METHOD		=> 'POST',
	     P_CONTENT		=> V_REQUEST,
	     P_CONTENT_TYPE	=> 'application/json',
	     P_HTTP_STATUS_CODE => V_HTTP_STATUS_CODE,
	     P_RESPONSE 	=> V_RESPONSE);

    BEGIN
	SELECT BRIDGE_LAUNCH_URL
	INTO   P_LAUNCH_URL
	FROM JSON_TABLE(V_RESPONSE, '$' Columns(
	    BRIDGE_LAUNCH_URL	   VARCHAR2(1024)    PATH '$.bridgeLaunchUrl'));
    EXCEPTION WHEN OTHERS THEN
	RAISE_APPLICATION_ERROR(-20001, 'Unable to parse launch context response.');
    END;

END LAUNCH_CONTEXT;

--##----------------------------------------------------------------------------
PROCEDURE VOID(P_BRN_NO 	IN  NUMBER,
	       P_DOC_ID 	IN  VARCHAR2,
	       P_TOTAL_AMT	IN  NUMBER,
	       P_SHOP_ID	IN  VARCHAR2 DEFAULT NULL,
	       P_DESK_ID	IN  VARCHAR2 DEFAULT NULL,
	       P_SHOP_ASSISTANT IN  VARCHAR2 DEFAULT NULL,
	       P_TILL		IN  VARCHAR2 DEFAULT NULL,
	       P_POS_TYPE	IN  VARCHAR2 DEFAULT NULL,
	       P_SENDER_ID	IN  VARCHAR2 DEFAULT 'OnyxErp Pos v8.2',
	       P_CREDIT_NOTE_NO IN  VARCHAR2 DEFAULT NULL)
IS
V_URL		    VARCHAR2(100) := '/api/integration/void';
V_REQUEST	    VARCHAR2(4000);
V_HTTP_STATUS_CODE  NUMBER;
V_RESPONSE	    CLOB;
V_VOID_SUCCESSFUL   VARCHAR2(5);
V_RESULT_MESSAGE    VARCHAR2(1024);
BEGIN

    SET_WEB_SRVC_PRMTR(P_BRN_NO);

    V_REQUEST := '{
  "TotalGrossAmount": '||P_TOTAL_AMT||',
  "DocIdentifier": "'||P_DOC_ID||'",
  "Shop": {
    "shopId": "'||P_SHOP_ID||'",
    "deskId": "'||P_DESK_ID||'",
    "shopAssistant": "'||'S123123'||'",
    "till": "'||'TILL007'||'",
    "posType": "'||P_POS_TYPE||'"
  },
  "SenderId": "'||P_SENDER_ID||'",
  "CreditNoteNumber": "'||P_CREDIT_NOTE_NO||'",
  "CreditNotePrinting": true
}';

dbms_output.put_line(v_request);


    CALL_API(P_URL		=> G_BASE_URL || V_URL,
	     P_METHOD		=> 'POST',
	     P_CONTENT		=> V_REQUEST,
	     P_CONTENT_TYPE	=> 'application/json',
	     P_HTTP_STATUS_CODE => V_HTTP_STATUS_CODE,
	     P_RESPONSE 	=> V_RESPONSE);

    BEGIN
	SELECT VOID_SUCCESSFUL,
	       RESULT_MESSAGE
	INTO   V_VOID_SUCCESSFUL,
	       V_RESULT_MESSAGE
	FROM JSON_TABLE(V_RESPONSE, '$' Columns(
	    VOID_SUCCESSFUL	   VARCHAR2(5)	     PATH '$.VoidSuccessful',
	    RESULT_MESSAGE	   VARCHAR2(1024)    PATH '$.ResultMessage'));
    EXCEPTION WHEN OTHERS THEN
	RAISE_APPLICATION_ERROR(-20001, 'Unable to parse launch context response.');
    END;

    IF LOWER(V_VOID_SUCCESSFUL) = 'false' THEN
	RAISE_APPLICATION_ERROR(-20001, V_RESULT_MESSAGE);
    END IF;


END VOID;

--##----------------------------------------------------------------------------
PROCEDURE SEARCH_TRANSACTIONS(P_RECEIPT_NO	    IN	VARCHAR2    DEFAULT NULL,
			      P_TORST_FRST_NM	    IN	VARCHAR2    DEFAULT NULL,
			      P_TORST_LST_NM	    IN	VARCHAR2    DEFAULT NULL,
			      P_TORST_PASSPORT_NO   IN	VARCHAR2    DEFAULT NULL,
			      P_FROM_ISSUE_DATE     IN	DATE	    DEFAULT NULL,
			      P_TO_ISSUE_DATE	    IN	DATE	    DEFAULT NULL,
			      P_SHOP_ID 	    IN	VARCHAR2    DEFAULT NULL,
			      P_DESK_ID 	    IN	VARCHAR2    DEFAULT NULL,
			      P_SHOP_ASSISTANT	    IN	VARCHAR2    DEFAULT NULL,
			      P_TILL		    IN	VARCHAR2    DEFAULT NULL,
			      P_POS_TYPE	    IN	VARCHAR2    DEFAULT NULL,
			      P_DOC_ID		    OUT VARCHAR2)
IS
V_URL			VARCHAR2(100) := '/api/integration/search-transactions';
V_REQUEST		VARCHAR2(4000);
V_RECEIPT_NO		VARCHAR2(100);
V_TORST_FRST_NM 	VARCHAR2(100);
V_TORST_LST_NM		VARCHAR2(100);
V_TORST_PASSPORT_NO	VARCHAR2(100);
V_FROM_ISSUE_DATE	VARCHAR2(100);
V_TO_ISSUE_DATE 	VARCHAR2(100);
V_SHOP_ID		VARCHAR2(100);
V_DESK_ID		VARCHAR2(100);
V_SHOP_ASSISTANT	VARCHAR2(100);
V_TILL			VARCHAR2(100);
V_POS_TYPE		VARCHAR2(100);
V_HTTP_STATUS_CODE  NUMBER;
V_RESPONSE	    CLOB;
BEGIN

    V_RECEIPT_NO	:= CASE WHEN P_RECEIPT_NO	 IS NULL THEN 'null' ELSE '"'||P_RECEIPT_NO||'"' END;
    V_TORST_FRST_NM	:= CASE WHEN P_TORST_FRST_NM	 IS NULL THEN 'null' ELSE '"'||P_TORST_FRST_NM||'"' END;
    V_TORST_LST_NM	:= CASE WHEN P_TORST_LST_NM	 IS NULL THEN 'null' ELSE '"'||P_TORST_LST_NM||'"' END;
    V_TORST_PASSPORT_NO := CASE WHEN P_TORST_PASSPORT_NO IS NULL THEN 'null' ELSE '"'||P_TORST_PASSPORT_NO||'"' END;
    V_FROM_ISSUE_DATE	:= CASE WHEN P_FROM_ISSUE_DATE	 IS NULL THEN 'null' ELSE '"'||TO_CHAR(CAST(P_FROM_ISSUE_DATE AS TIMESTAMP) AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"')||'"' END;
    V_TO_ISSUE_DATE	:= CASE WHEN P_TO_ISSUE_DATE	 IS NULL THEN 'null' ELSE '"'||TO_CHAR(CAST(P_TO_ISSUE_DATE AS TIMESTAMP) AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"')||'"' END;
    V_SHOP_ID		:= CASE WHEN P_SHOP_ID		 IS NULL THEN 'null' ELSE '"'||P_SHOP_ID||'"' END;
    V_DESK_ID		:= CASE WHEN P_DESK_ID		 IS NULL THEN 'null' ELSE '"'||P_DESK_ID||'"' END;
    V_SHOP_ASSISTANT	:= CASE WHEN P_SHOP_ASSISTANT	 IS NULL THEN 'null' ELSE '"'||P_SHOP_ASSISTANT||'"' END;
    V_TILL		:= CASE WHEN P_TILL		 IS NULL THEN 'null' ELSE '"'||P_TILL||'"' END;
    V_POS_TYPE		:= CASE WHEN P_POS_TYPE 	 IS NULL THEN 'null' ELSE '"'||P_POS_TYPE||'"' END;

    V_REQUEST := '{
  "ShopInvoiceNumber": null,
  "ReceiptNumber": '||V_RECEIPT_NO||',
  "TouristFirstName": '||V_TORST_FRST_NM||',
  "TouristLastName": '||V_TORST_LST_NM||',
  "TouristPassportNumber": '||V_TORST_PASSPORT_NO||',
  "FromIssueDate": '||V_FROM_ISSUE_DATE||',
  "ToIssueDate": '||V_TO_ISSUE_DATE||',
  "Shop": {
    "shopId": '||V_SHOP_ID||',
    "deskId": '||V_DESK_ID||',
    "shopAssistant": '||V_SHOP_ASSISTANT||',
    "till": '||V_TILL||',
    "posType": '||V_POS_TYPE||'
  }
}';

    DBMS_OUTPUT.PUT_LINE(V_REQUEST);

    CALL_API(P_URL		=> G_BASE_URL || V_URL,
	     P_METHOD		=> 'POST',
	     P_CONTENT		=> V_REQUEST,
	     P_CONTENT_TYPE	=> 'application/json',
	     P_HTTP_STATUS_CODE => V_HTTP_STATUS_CODE,
	     P_RESPONSE 	=> V_RESPONSE);

    BEGIN
	FOR I IN (SELECT *
	FROM JSON_TABLE(V_RESPONSE, '$.Transactions[*]' Columns(
	    DOC_ID	  VARCHAR2(100)       PATH '$.Overview.NumericDocIdentifier',
	    ISSUE_DATE	  VARCHAR2(100)       PATH '$.Overview.IssueDate'))
	ORDER BY TO_TIMESTAMP_TZ(
	   ISSUE_DATE,
	   'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM'
	 ) desc
	 --FETCH FIRST 1 ROW ONLY
	 )
	LOOP
	    DBMS_OUTPUT.PUT_LINE('DOCUMENET ID: '||I.DOC_ID);
	END LOOP;
    /*EXCEPTION WHEN OTHERS THEN
	RAISE_APPLICATION_ERROR(-20001, 'Unable to parse launch context response.');*/
    END;
END SEARCH_TRANSACTIONS;

--##----------------------------------------------------------------------------
PROCEDURE CHECK_DOC_STATUS(P_DOC_ID	IN  VARCHAR2,
			   P_DOC_STATUS OUT VARCHAR2)
IS
V_URL		    VARCHAR2(100) := '/api/integration/search-by-docid/'||P_DOC_ID;
V_HTTP_STATUS_CODE  NUMBER;
V_RESPONSE	    CLOB;
BEGIN
    CALL_API(P_URL		=> G_BASE_URL || V_URL,
	     P_METHOD		=> 'GET',
	     P_CONTENT		=> null,
	     P_CONTENT_TYPE	=> null,
	     P_HTTP_STATUS_CODE => V_HTTP_STATUS_CODE,
	     P_RESPONSE 	=> V_RESPONSE);

    BEGIN
	SELECT ISSUED_STATUS
	INTO   P_DOC_STATUS
	FROM JSON_TABLE(V_RESPONSE, '$' Columns(
	    ISSUED_STATUS	 VARCHAR2(20)	    PATH '$.TaxFreeForm.TaxFreeFormOverview.IssuedStatus'));
    EXCEPTION WHEN OTHERS THEN
	RAISE_APPLICATION_ERROR(-20001, 'Unable to parse launch context response.');
    END;
END;

--##----------------------------------------------------------------------------
FUNCTION IS_DOC_VOIDABLE(P_DOC_ID     IN  VARCHAR2)
RETURN BOOLEAN
IS
V_URL		    VARCHAR2(100) := '/api/integration/taxfreeform/'||P_DOC_ID||'/voidable';
V_HTTP_STATUS_CODE  NUMBER;
V_RESPONSE	    CLOB;
V_IS_VOIDABLE	    VARCHAR2(5);
BEGIN
    CALL_API(P_URL		=> G_BASE_URL || V_URL,
	     P_METHOD		=> 'GET',
	     P_CONTENT		=> null,
	     P_CONTENT_TYPE	=> null,
	     P_HTTP_STATUS_CODE => V_HTTP_STATUS_CODE,
	     P_RESPONSE 	=> V_RESPONSE);

    BEGIN
	SELECT IS_VOIDABLE
	INTO   V_IS_VOIDABLE
	FROM JSON_TABLE(V_RESPONSE, '$' Columns(
	    IS_VOIDABLE        VARCHAR2(5)	 PATH '$.isVoidable'));
    EXCEPTION WHEN OTHERS THEN
	RAISE_APPLICATION_ERROR(-20001, 'Unable to parse launch context response.');
    END;

    RETURN LOWER(V_IS_VOIDABLE) = 'true';
END IS_DOC_VOIDABLE;

--##----------------------------------------------------------------------------
FUNCTION GET_PDF(P_BRN_NO	IN  NUMBER,
		 P_DOC_ID	IN  VARCHAR2) RETURN BLOB
IS
V_RESPONSE_BLOB     BLOB;
V_RESPONSE_CODE     NUMBER;
V_FILE_NAME	    VARCHAR2(100);

V_HEADER	    IAS_WEB_SRVC_PKG.HTTP_HDR;
V_HEADERS	    IAS_WEB_SRVC_PKG.HTTP_HDR_TBL := IAS_WEB_SRVC_PKG.HTTP_HDR_TBL();
BEGIN

    SET_WEB_SRVC_PRMTR(P_BRN_NO);

    IF G_USERNAME IS NOT NULL AND G_PASSWORD IS NOT NULL THEN
	V_HEADER.header_attr  := 'X-GB-Username';
	V_HEADER.header_value := G_USERNAME;

	V_HEADERS.EXTEND;
	V_HEADERS(V_HEADERS.COUNT) := V_HEADER;

	V_HEADER.header_attr  := 'X-GB-Password';
	V_HEADER.header_value := G_PASSWORD;

	V_HEADERS.EXTEND;
	V_HEADERS(V_HEADERS.COUNT) := V_HEADER;
    END IF;

    SET_WEB_SRVC_PRMTR(P_BRN_NO);
    IAS_WEB_SRVC_PKG.CALL_WEB_SERVICE_BLOB(P_URL		=> G_BASE_URL || '/api/integration/reprint/' || P_DOC_ID,
					   P_METHOD		=> 'GET',
					   P_CONTENT_TYPE	=> 'application/json',
					   P_CONTENT		=> NULL,
					   P_RESPONSE_BLOB	=> V_RESPONSE_BLOB,
					   P_HTTP_RSPONS_CODE	=> V_RESPONSE_CODE,
					   P_FILE_NAME		=> V_FILE_NAME,
					   P_WALLET_PATH	=> NULL,
					   P_WALLET_PWD 	=> NULL,
					   P_HEADER		=> CASE V_HEADERS.COUNT WHEN 0 THEN NULL ELSE V_HEADERS END,
					   P_TOKEN		=> NULL);

    IF V_RESPONSE_CODE NOT BETWEEN 200 AND 299 THEN
	RAISE_APPLICATION_ERROR(-20400, IAS_WEB_SRVC_PKG.BLOB_TO_CLOB(V_RESPONSE_BLOB));
    END IF;
    RETURN V_RESPONSE_BLOB;
END;

--##----------------------------------------------------------------------------
PROCEDURE SET_WEB_SRVC_PRMTR(P_BRN_NO	  IN	  NUMBER)
IS
BEGIN
    SELECT
	SRVC_URL,
	USER_NAME,
	PASSWORD,
	NVL(IAS_PRMTR_PKG.GETPVAL(P_PRMTR=>'LANG_NO'), 1)
    INTO
	G_BASE_URL,
	G_USERNAME,
	G_PASSWORD,
	G_LANG_NO
    FROM GNR_WEB_SRVC_MST
    WHERE (UPPER(SRVC_L_DSC) = 'TFF' OR UPPER(SRVC_F_DSC) = 'TFF')
    AND (BRN_NO IS NULL OR BRN_NO=P_BRN_NO)
    AND ROWNUM<=1;


EXCEPTION WHEN
    NO_DATA_FOUND THEN
	RAISE_APPLICATION_ERROR(-20001, 'Error when getting web service parameters - No Data Found');
END SET_WEB_SRVC_PRMTR;


--##----------------------------------------------------------------------------
PROCEDURE CALL_API(P_URL		IN	VARCHAR2,
		   P_METHOD		IN	VARCHAR2,
		   P_CONTENT		IN	VARCHAR2,
		   P_CONTENT_TYPE	IN	VARCHAR2,
		   P_HTTP_STATUS_CODE	OUT	NUMBER,
		   P_RESPONSE		OUT	CLOB)
IS
V_RSPNS_BLOB	    BLOB;
V_FILE_NAME	    VARCHAR2(256);
V_MESSAGE	    VARCHAR2(1024);
V_SUCCESS	    VARCHAR2(10);
V_USER_MESSAGE	    VARCHAR2(1024);
V_JOBJ_TMP	    PLJSON;
V_ERR_MSG	    VARCHAR2(4000);

V_HEADER	    IAS_WEB_SRVC_PKG.HTTP_HDR;
V_HEADERS	    IAS_WEB_SRVC_PKG.HTTP_HDR_TBL := IAS_WEB_SRVC_PKG.HTTP_HDR_TBL();
BEGIN
    IF NVL(P_URL,'') = '' THEN
	RAISE_APPLICATION_ERROR(-20001,'Invalid value for parameter p_url');
    END IF;

    IF G_USERNAME IS NOT NULL AND G_PASSWORD IS NOT NULL THEN
	V_HEADER.header_attr  := 'X-GB-Username';
	V_HEADER.header_value := G_USERNAME;

	V_HEADERS.EXTEND;
	V_HEADERS(V_HEADERS.COUNT) := V_HEADER;

	V_HEADER.header_attr  := 'X-GB-Password';
	V_HEADER.header_value := G_PASSWORD;

	V_HEADERS.EXTEND;
	V_HEADERS(V_HEADERS.COUNT) := V_HEADER;

    END IF;
    IAS_WEB_SRVC_PKG.CALL_WEB_SERVICE_BLOB(P_URL		=> P_URL,
					   P_METHOD		=> P_METHOD,
					   P_CONTENT_TYPE	=> 'application/json',
					   P_CONTENT		=> P_CONTENT,
					   P_RESPONSE_BLOB	=> V_RSPNS_BLOB,
					   P_HTTP_RSPONS_CODE	=> P_HTTP_STATUS_CODE,
					   P_FILE_NAME		=> V_FILE_NAME,
					   P_WALLET_PATH	=> NULL,
					   P_WALLET_PWD 	=> NULL,
					   P_HEADER		=> CASE V_HEADERS.COUNT WHEN 0 THEN NULL ELSE V_HEADERS END,
					   P_USERNAME		=> NULL,
					   P_PASSWORD		=> NULL,
					   P_TOKEN		=> NULL);

    P_RESPONSE := IAS_WEB_SRVC_PKG.BLOB_TO_CLOB(V_RSPNS_BLOB);
    --dbms_output.put_line('response:'||substr(p_response,0,300));

    IF P_HTTP_STATUS_CODE NOT IN (200,201, 202, 203, 204) THEN
	BEGIN
	    FOR I IN (
	    SELECT FIELD, MESSAGE
	    FROM JSON_TABLE(P_RESPONSE, '$.validationErrors[*]' Columns(
		FIELD		       VARCHAR2(250)	PATH '$.field',
		MESSAGE 	       VARCHAR2(250)	PATH '$.message')))
	    LOOP
		V_ERR_MSG := NVL(V_ERR_MSG,'')||'Field: '||I.FIELD||' - '||I.MESSAGE||CHR(10);
	    END LOOP;
	EXCEPTION WHEN OTHERS THEN
	    V_ERR_MSG := NULL;
	END;

	RAISE_APPLICATION_ERROR(TO_NUMBER('-20'||P_HTTP_STATUS_CODE), NVL(V_ERR_MSG, P_RESPONSE));
    END IF;

END CALL_API;

PROCEDURE EXPRT_BLOB_TO_PDF (P_BRN_NO	     IN  NUMBER,
			     P_DOC_ID	     IN  VARCHAR2,
			     P_DIR_NM	     IN VARCHAR2,
			     P_FILE_NM	   IN VARCHAR2 )
IS
    V_BLOB	BLOB;
    V_FILE	UTL_FILE.FILE_TYPE;
    V_BUFFER	RAW(32767);
    V_AMOUNT	BINARY_INTEGER := 32767;
    V_POS	INTEGER := 1;
    V_BLOB_LEN	INTEGER;
BEGIN

     Begin
       v_blob:=GET_PDF(P_BRN_NO       => P_BRN_NO,
		       P_DOC_ID       => P_DOC_ID);
    Exception When Others Then
      Null;
    End;

    V_BLOB_LEN := DBMS_LOB.GETLENGTH(V_BLOB);


    V_FILE := UTL_FILE.FOPEN(P_DIR_NM, P_FILE_NM, 'WB', 32767);


    WHILE V_POS <= V_BLOB_LEN LOOP
	DBMS_LOB.READ(V_BLOB, V_AMOUNT, V_POS, V_BUFFER);
	UTL_FILE.PUT_RAW(V_FILE, V_BUFFER, TRUE);
	V_POS := V_POS + V_AMOUNT;
    END LOOP;

    UTL_FILE.FCLOSE(V_FILE);

EXCEPTION
    WHEN OTHERS THEN
	IF UTL_FILE.IS_OPEN(V_FILE) THEN
	   UTL_FILE.FCLOSE(V_FILE);
	END IF;
	RAISE;

END EXPRT_BLOB_TO_PDF;

END GNR_TFF_GATEWAY_PKG
;
/
