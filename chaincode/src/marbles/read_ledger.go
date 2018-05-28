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
	//"bytes"
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// ============================================================================================================================
// Read - read a generic variable from ledger
//
// Shows Off GetState() - reading a key/value from the ledger
//
// Inputs - Array of strings
//  0
//  key
//  "abc"
// 
// Returns - string
// ============================================================================================================================
func read(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var key, jsonResp string
	var err error
	fmt.Println("starting read")

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting key of the var to query")
	}

	// input sanitation
	err = sanitize_arguments(args)
	if err != nil {
		return shim.Error(err.Error())
	}

	key = args[0]
	valAsbytes, err := stub.GetState(key)           //get the var from ledger
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get state for " + key + "\"}"
		return shim.Error(jsonResp)
	}

	fmt.Println("- end read")
	return shim.Success(valAsbytes)                  //send it onward
}

// ============================================================================================================================
// Get everything we need (owners + marbles + companies)
//
// Inputs - none
//
// Returns:
// {
//	"owners": [{
//			"id": "o99999999",
//			"company": "United Marbles"
//			"username": "alice"
//	}],
//	"marbles": [{
//		"id": "m1490898165086",
//		"color": "white",
//		"docType" :"marble",
//		"owner": {
//			"company": "United Marbles"
//			"username": "alice"
//		},
//		"size" : 35
//	}]
// }
// ============================================================================================================================
func read_everything(stub shim.ChaincodeStubInterface) pb.Response {
	type Everythings struct {
		Accounts   []Account    `json:"accounts"`
	}
	var everything Everythings

	resultsIterator, err := stub.GetStateByRange("00000000000000000000000000000000", "ffffffffffffffffffffffffffffffff")
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()
	
	for resultsIterator.HasNext() {
		aKeyValue, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		queryKeyAsStr := aKeyValue.Key
		queryValAsBytes := aKeyValue.Value
		fmt.Println("on account id - ", queryKeyAsStr)
		var account Account
		json.Unmarshal(queryValAsBytes, &account)                  //un stringify it aka JSON.parse()
		everything.Accounts = append(everything.Accounts, account)   
	}
		
	fmt.Println("marble array - ", everything.Accounts)
	//change to array of bytes
	everythingAsBytes, _ := json.Marshal(everything)              //convert to array of bytes
	return shim.Success(everythingAsBytes)
}

func read_account(stub shim.ChaincodeStubInterface) pb.Response {
	type Everythings struct {
		Accounts   []Account    `json:"accounts"`
	}
	var everything Everythings
	
	resultsIterator, err := stub.GetStateByRange("00000000000000000000000000000000", "ffffffffffffffffffffffffffffffff")
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()
	
	for resultsIterator.HasNext() {
		aKeyValue, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		queryKeyAsStr := aKeyValue.Key
		queryValAsBytes := aKeyValue.Value
		fmt.Println("on account id - ", queryKeyAsStr)
		var account Account
		json.Unmarshal(queryValAsBytes, &account)                  //un stringify it aka JSON.parse()
		if account.Type_=="account"{
			everything.Accounts = append(everything.Accounts, account)   
		}
	}
		
	fmt.Println("marble array - ", everything.Accounts)
	//change to array of bytes
	everythingAsBytes, _ := json.Marshal(everything)              //convert to array of bytes
	return shim.Success(everythingAsBytes)
}

func read_ac_trade(stub shim.ChaincodeStubInterface) pb.Response {
	type Everythings struct {
		Accounts   []Account    `json:"accounts"`
	}
	var everything Everythings
	
	resultsIterator, err := stub.GetStateByRange("00000000000000000000000000000000", "ffffffffffffffffffffffffffffffff")
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()
	
	for resultsIterator.HasNext() {
		aKeyValue, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		queryKeyAsStr := aKeyValue.Key
		queryValAsBytes := aKeyValue.Value
		fmt.Println("on account id - ", queryKeyAsStr)
		var account Account
		json.Unmarshal(queryValAsBytes, &account)                  //un stringify it aka JSON.parse()
		if account.Type_=="ac_trade"{
			everything.Accounts = append(everything.Accounts, account)   
		}
	}
		
	fmt.Println("marble array - ", everything.Accounts)
	//change to array of bytes
	everythingAsBytes, _ := json.Marshal(everything)              //convert to array of bytes
	return shim.Success(everythingAsBytes)
}

func read_ac_benchmark(stub shim.ChaincodeStubInterface) pb.Response {
	type Everythings struct {
		Accounts   []Account    `json:"accounts"`
	}
	var everything Everythings

	// ---- Get All Marbles ---- //
	resultsIterator, err := stub.GetStateByRange("00000000000000000000000000000000", "ffffffffffffffffffffffffffffffff")
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()
	
	for resultsIterator.HasNext() {
		aKeyValue, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		queryKeyAsStr := aKeyValue.Key
		queryValAsBytes := aKeyValue.Value
		fmt.Println("on account id - ", queryKeyAsStr)
		var account Account
		json.Unmarshal(queryValAsBytes, &account)                  //un stringify it aka JSON.parse()
		if account.Type_=="ac_benchmark" {	
			everything.Accounts = append(everything.Accounts, account)   
		}
	}
		
	fmt.Println("marble array - ", everything.Accounts)
	//change to array of bytes
	everythingAsBytes, _ := json.Marshal(everything)              //convert to array of bytes
	return shim.Success(everythingAsBytes)
}

func read_benchmarks(stub shim.ChaincodeStubInterface) pb.Response {
	type Everythings struct {
		Accounts   []Account    `json:"accounts"`
	}
	var everything Everythings

	// ---- Get All Marbles ---- //
	resultsIterator, err := stub.GetStateByRange("00000000000000000000000000000000", "ffffffffffffffffffffffffffffffff")
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()
	
	for resultsIterator.HasNext() {
		aKeyValue, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		queryKeyAsStr := aKeyValue.Key
		queryValAsBytes := aKeyValue.Value
		fmt.Println("on account id - ", queryKeyAsStr)
		var account Account
		json.Unmarshal(queryValAsBytes, &account)                  //un stringify it aka JSON.parse()
		if account.Type_=="benchmarks" {	
			everything.Accounts = append(everything.Accounts, account)   
		}
	}
		
	fmt.Println("marble array - ", everything.Accounts)
	//change to array of bytes
	everythingAsBytes, _ := json.Marshal(everything)              //convert to array of bytes
	return shim.Success(everythingAsBytes)
}

