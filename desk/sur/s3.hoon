|%
++  intake
  |%
    +$  listv2
      %-  list
      $%  [%continuation-token p=@t]
          [%delimiter p=@t]
          [%encoding-type p=@t]
          [%fetch-owner p=?(%true %false)]
          [%max-keys p=@ud]
          [%prefix p=@t]
          [%start-after p=@t]
          [%x-amz-expected-bucket-owner p=@t]
      ==  
    ::
  --
++  echo
  |%
    +$  object
      $:  key=@t
          etag=@t
          size=@ud
          last=@da
          owner=[name=@t id=@t]
          class=@t
          sum=@t
      ==
    ::
    +$  listv2
      $:  name=@t
          contents=(list object)
          prefix=@t
          delim=@t
          max=@ud
          count=@ud
          code=@t
          cont=@t
          next=@t
          after=@t
          brief=?
      ==
    ::
  --
--