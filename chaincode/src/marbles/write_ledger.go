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
	"fmt"
	//"strconv"
	//"strings"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// ============================================================================================================================
// write() - genric write variable into ledger
// 
// Shows Off PutState() - writting a key/value into the ledger
//
// Inputs - Array of strings
//    0   ,    1
//   key  ,  value
//  "abc" , "test"
// ============================================================================================================================
func write(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var key, value string
	var err error
	fmt.Println("starting write")

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2. key of the variable and value to set")
	}

	// input sanitation
	err = sanitize_arguments(args)
	if err != nil {
		return shim.Error(err.Error())
	}

	key = args[0]                                   //rename for funsies
	value = args[1]
	err = stub.PutState(key, []byte(value))         //write the variable into the ledger
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("- end write")
	return shim.Success(nil)
}

func create_account(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error
	fmt.Println("- start create user")
	
	err = sanitize_arguments(args)
	if err != nil {
		return shim.Error(err.Error())
	}
	
	//var newaccount Account
	newaccount := Account{}
	newaccount.Type_= args[0]
	newaccount.Hash_id= args[1]				
	//newaccount.hash= args[2]
	
	_, err = get_account(stub, newaccount.Hash_id)
	if err == nil {
		fmt.Println("This account already exists - " + newaccount.Hash_id)
		return shim.Error("This account already exists - " + newaccount.Hash_id)
	}

	// str := `{
	// 	"type_":"account", 
	// 	"hash_id": "` + args[1] + `", 
	// }`
	jsonAsBytes, _ := json.Marshal(newaccount)
	
	err = stub.PutState(newaccount.Hash_id, jsonAsBytes)     
	// err = stub.PutState(newaccount.hash_id, []byte(str))     
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("- end create account")
	return shim.Success(nil)

	// acJson, err := stub.GetState(accountStr)
	// fmt.Println(acJson)
	// if err != nil {
	// 	return shim.Error(err.Error())
	// }
	
	// json.Unmarshal(acJson, &tmp_account)
	// str_newac, _ := json.Marshal(newaccount)
	// tmp_account=append(tmp_account, string(str_newac))
	// jsonAsBytes, _ := json.Marshal(tmp_account)
	// err = stub.PutState(accountStr, jsonAsBytes)	
	
	// fmt.Println("- end create user")
	// return shim.Success(nil)
}

func ac_trade_setup(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error
	fmt.Println("- start create user")
	
	err = sanitize_arguments(args)
	if err != nil {
		return shim.Error(err.Error())
	}

	//var newaccount Account
	newaccount := Account{}
	newaccount.Type_= args[0]
	newaccount.Hash_id= args[1]	
	//newaccount.hash= args[2]

	_, err = get_account(stub, newaccount.Hash_id)
	if err == nil {
		fmt.Println("This ac_trade already exists - " + newaccount.Hash_id)
		return shim.Error("This ac_trade already exists - " + newaccount.Hash_id)
	}

	jsonAsBytes, _ := json.Marshal(newaccount)         
	err = stub.PutState(newaccount.Hash_id, jsonAsBytes)     
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("- end create account")
	return shim.Success(nil)

	// acJson, err := stub.GetState(actradeStr)
	// if err != nil {
	// 	return shim.Error(err.Error())
	// }
	
	// json.Unmarshal(acJson, &tmp_tradeset)
	// str_newtra, _ := json.Marshal(newaccount)
	
	// tmp_allacben=append(tmp_allacben, string(str_newtra))
	// jsonAsBytes, _ := json.Marshal(tmp_allacben)
	// err = stub.PutState(actradeStr, jsonAsBytes)	
	
	// fmt.Println("- end create user")
	// return shim.Success(nil)
}

func ac_benchmark(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error
	fmt.Println("- start create user")
	
	err = sanitize_arguments(args)
	if err != nil {
		return shim.Error(err.Error())
	}

	//var newaccount Account
	newaccount := Account{}
	newaccount.Type_= args[0]
	newaccount.Hash_id= args[1]					
	//newaccount.hash= args[2]

	_, err = get_account(stub, newaccount.Hash_id)
	if err == nil {
		fmt.Println("This ac_benchmark already exists - " + newaccount.Hash_id)
		return shim.Error("This ac_benchmark already exists - " + newaccount.Hash_id)
	}

	jsonAsBytes, _ := json.Marshal(newaccount)         //convert to array of bytes
	err = stub.PutState(newaccount.Hash_id, jsonAsBytes)     //rewrite the owner
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("- end create account")
	return shim.Success(nil)

	// acJson, err := stub.GetState(acbenchStr)
	// if err != nil {
	// 	return shim.Error(err.Error())
	// }
	
	// json.Unmarshal(acJson, &tmp_allacben)
	// str_newacben, _ := json.Marshal(newaccount)
	
	// tmp_allacben=append(tmp_allacben, string(str_newacben))
	// jsonAsBytes, _ := json.Marshal(tmp_allacben)
	// err = stub.PutState(acbenchStr, jsonAsBytes)	
	
	// fmt.Println("- end create user")
	// return shim.Success(nil)
}

func benchmarks(stub shim.ChaincodeStubInterface, args []string)pb.Response {
	var err error
	fmt.Println("- start create user")
	
	err = sanitize_arguments(args)
	if err != nil {
		return shim.Error(err.Error())
	}

	//var newaccount Account
	newaccount := Account{}
	newaccount.Type_= args[0]
	newaccount.Hash_id= args[1]					
	//newaccount.hash= args[2]

	_, err = get_account(stub, newaccount.Hash_id)
	if err == nil {
		fmt.Println("This benchmark already exists - " + newaccount.Hash_id)
		return shim.Error("This benchmark already exists - " + newaccount.Hash_id)
	}

	jsonAsBytes, _ := json.Marshal(newaccount)         //convert to array of bytes
	err = stub.PutState(newaccount.Hash_id, jsonAsBytes)     //rewrite the owner
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("- end create account")
	return shim.Success(nil)
	
	// acJson, err := stub.GetState(benchStr)
	// if err != nil {
	// 	return shim.Error(err.Error())
	// }
	
	// json.Unmarshal(acJson, &tmp_allbench)
	// str_newbench, _ := json.Marshal(newaccount)
	// tmp_allbench=append(tmp_allbench, string(str_newbench))
	// jsonAsBytes, _ := json.Marshal(tmp_allbench)
	// err = stub.PutState(benchStr, jsonAsBytes)	
	
	// fmt.Println("- end create user")
	// return shim.Success(nil)
}

func delete_account(stub shim.ChaincodeStubInterface, args []string) (pb.Response) {
	fmt.Println("starting delete_account")

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	// input sanitation
	err := sanitize_arguments(args)
	if err != nil {
		return shim.Error(err.Error())
	}

	id := args[0]

	// get the accout
	account, err := get_account(stub, id)
	if err != nil{
		fmt.Println("Failed to find account by id " + id)
		return shim.Error(err.Error())
	}

	if(account.Type_!=args[1]){
		return shim.Error("Deletion for wrong account type")
	}

	// remove the account
	err = stub.DelState(id)                                                 //remove the key from chaincode state
	if err != nil {
		return shim.Error("Failed to delete state")
	}

	fmt.Println("- end delete_account")
	return shim.Success(nil)
}