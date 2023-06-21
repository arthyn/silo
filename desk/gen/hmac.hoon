=,  hmac:crypto
|=  reg=@t
=/  deal  'AWS4-HMAC-SHA256\0a20150830T123600Z\0a20150830/us-east-1/iam/aws4_request\0af536975d06c0309214f805bb90ccff089219ecd68b2577efef23edd43b7e1a59'
%+  en:base16:mimes:html  32
%+  hmac-sha256
  %+  hmac-sha256
    %+  hmac-sha256
      %+  hmac-sha256
        %+  hmac-sha256t
          (crip (weld "AWS4" "wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY"))
        '20150830'
      (swp 3 reg)
    (swp 3 'iam')
  (swp 3 'aws4_request')
(swp 3 deal)