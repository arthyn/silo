/-  spider
/+  strandio, s3
=,  strand=strand:spider
^-  thread:spider
|=  arg=vase
=/  m  (strand ,vase)
^-  form:m
;<  now=@da  bind:m  get-time:strandio
=/  client  ~(. s3 ['https://nyc3.digitaloceanspaces.com' 'us-east-1' 'secret' 'key' now])
=/  =task:iris  
  (list-objects-v2:client 'hmillerdev' ~[[%prefix 'beam']])
=/  =card:agent:gall  [%pass /http-req %arvo %i task]
;<  ~  bind:m  (send-raw-card:strandio card)
;<  res=(pair wire sign-arvo)  bind:m  take-sign-arvo:strandio
?.  ?=([%iris %http-response %finished *] q.res)
  (strand-fail:strand %bad-sign ~)
?~  full-file.client-response.q.res
  (strand-fail:strand %no-body ~)
=/  =path  /list-objects/txt
=/  out  [path (de-xml:html `@t`q.data.u.full-file.client-response.q.res)]
;<  ~  bind:m  (poke-our:strandio %hood drum-put+!>(out))
(pure:m *vase)