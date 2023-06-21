/-  s3
/+  aws
|_  [endpoint=@t reg=@t secret=@t key=@t now=@da]
+$  purl  purl:eyre
++  aws-client  ~(. aws [reg 's3' secret key now])
++  list-objects-v2
  |%
  ++  send
    |=  [bucket=@t params=listv2:intake:s3]
    ^-  task:iris
    =/  url=purl  (need (de-purl:html endpoint))
    %-  task
    :^    %'GET'
        %-  crip
          %-  en-purl:html
            =:  q.url  [~ ~[bucket]]
                r.url  
                  %+  snoc 
                    %+  turn
                      params
                    |=  [=term p=@]
                    [`@t`term `@t`p]
                  ['list-type' '2']
            ==
          url
      :~
        host-header
      ==
    ~
  ++  accept
    |=  response=@t
    =/  xml  (de-xml:html response)

  --
++  task
  |=  =request:http
  :+  %request
    (evict (auth:aws-client request))
  *outbound-config:iris
++  host-header
  :-  'Host'
      %-  crip
      %+  scan  (trip endpoint)
    ;~(pfix (jest 'https://') (star prn))
++  evict
  |=  =request:http
  =.  header-list.request
    %+  skim
      header-list.request
    |=  [key=@t value=@t]
    ?!(=(key 'Host'))
  request
--