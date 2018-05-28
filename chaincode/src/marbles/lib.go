/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

package main

import (
	"encoding/json"
	"errors"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

// ============================================================================================================================
// Get Owner - get the owner asset from ledger
// ============================================================================================================================
func get_account(stub shim.ChaincodeStubInterface, id string) (Account, error) {
	var account Account
	accountAsBytes, err := stub.GetState(id)                     //getState retreives a key/value from the ledger
	if err != nil {                                            //this seems to always succeed, even if key didn't exist
		return account, errors.New("Failed to get account - " + id)
	}
	json.Unmarshal(accountAsBytes, &account)                       //un stringify it aka JSON.parse()

	if len(account.Type_) == 0 {                              //test if owner is actually here or just nil
		return account, errors.New("Account does not exist - " + id + ", '" + account.Type_ + "' '" )
	}
	
	return account, nil
}

// ========================================================
// Input Sanitation - dumb input checking, look for empty strings
// ========================================================
func sanitize_arguments(strs []string) error{
	for i, val:= range strs {
		if len(val) <= 0 {
			return errors.New("Argument " + strconv.Itoa(i) + " must be a non-empty string")
		}
		if len(val) > 64 {
			return errors.New("Argument " + strconv.Itoa(i) + " must be <= 64 characters")
		}
	}
	return nil
}
