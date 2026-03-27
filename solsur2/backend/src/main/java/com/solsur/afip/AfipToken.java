package com.solsur.afip;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AfipToken {
    private String token;
    private String sign;
}
